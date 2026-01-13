import { prisma } from "@/lib/prisma";

export interface SendNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export class SendNotificationUseCase {
  async execute(input: SendNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        read: false,
      },
    });

    return notification;
  }
}














