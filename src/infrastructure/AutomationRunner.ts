import { AutoCloseTourUseCase } from '@/application/automation/use-cases/AutoCloseTourUseCase';
import { DetectNoShowUseCase } from '@/application/automation/use-cases/DetectNoShowUseCase';

export class AutomationRunner {
    constructor(
        private autoCloseUseCase: AutoCloseTourUseCase,
        private detectNoShowUseCase: DetectNoShowUseCase
    ) { }

    async runAll(): Promise<any> {
        console.log('[Automation] Starting run...');

        const autoCloseResult = await this.autoCloseUseCase.execute();
        console.log('[Automation] AutoClose:', autoCloseResult);

        const noShowResult = await this.detectNoShowUseCase.execute();
        console.log('[Automation] NoShow:', noShowResult);

        return {
            autoClose: autoCloseResult,
            noShow: noShowResult,
            timestamp: new Date()
        };
    }
}
