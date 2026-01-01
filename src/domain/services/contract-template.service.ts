import { prisma } from "@/lib/prisma";
import { ContractTemplateCategory } from "@prisma/client";

export interface CreateContractTemplateInput {
  name: string;
  category: ContractTemplateCategory;
  description?: string;
  content: string;
  variables: Record<string, string>; // Variable name -> description
  createdBy?: string; // Admin user ID
}

export interface UpdateContractTemplateInput {
  templateId: string;
  name?: string;
  description?: string;
  content?: string;
  variables?: Record<string, string>;
  isActive?: boolean;
}

export interface ReplaceTemplateVariablesInput {
  templateContent: string;
  variables: Record<string, string | number | Date>; // Variable name -> value
}

export class ContractTemplateService {
  /**
   * Get all active contract templates
   */
  static async getActiveTemplates(category?: ContractTemplateCategory) {
    return prisma.contractTemplate.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(templateId: string) {
    return prisma.contractTemplate.findUnique({
      where: { id: templateId },
    });
  }

  /**
   * Create a new contract template
   */
  static async createTemplate(input: CreateContractTemplateInput) {
    return prisma.contractTemplate.create({
      data: {
        name: input.name,
        category: input.category,
        description: input.description,
        content: input.content,
        variables: input.variables,
        createdBy: input.createdBy,
      },
    });
  }

  /**
   * Update a contract template
   */
  static async updateTemplate(input: UpdateContractTemplateInput) {
    const existing = await prisma.contractTemplate.findUnique({
      where: { id: input.templateId },
    });

    if (!existing) {
      throw new Error("Contract template not found");
    }

    // Increment version if content changed
    const version = input.content && input.content !== existing.content
      ? existing.version + 1
      : existing.version;

    return prisma.contractTemplate.update({
      where: { id: input.templateId },
      data: {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        content: input.content ?? existing.content,
        variables: (input.variables ?? existing.variables) as any,
        isActive: input.isActive ?? existing.isActive,
        version,
      },
    });
  }

  /**
   * Replace template variables with actual values
   */
  static replaceVariables(input: ReplaceTemplateVariablesInput): string {
    let content = input.templateContent;

    // Replace all variables in format {{variable.name}}
    for (const [key, value] of Object.entries(input.variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      
      // Format value based on type
      let formattedValue: string;
      if (value instanceof Date) {
        formattedValue = value.toLocaleDateString("vi-VN");
      } else if (typeof value === "number") {
        formattedValue = value.toLocaleString("vi-VN");
      } else {
        formattedValue = String(value);
      }

      content = content.replace(regex, formattedValue);
    }

    return content;
  }

  /**
   * Get variables from template content
   */
  static extractVariables(templateContent: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(templateContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Validate template variables
   */
  static validateVariables(
    templateContent: string,
    providedVariables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const requiredVariables = this.extractVariables(templateContent);
    const missing = requiredVariables.filter(
      (varName) => !(varName in providedVariables)
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

