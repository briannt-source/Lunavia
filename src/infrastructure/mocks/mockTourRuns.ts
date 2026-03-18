import { TourRun } from '@/domain/tour/TourRun';

export function getActiveTourRuns(): TourRun[] {
  return [
    {
      id: 'run-1',
      tourName: 'Ha Long Bay Cruise',
      operatorName: 'Oceanic Tours',
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 1000 * 60 * 60),
      vehicle: 'Boat #A12',
      guideName: 'Guide Anh',
      latitude: 20.9211,
      longitude: 107.0558,
      companyId: 'company-demo',
    } as any,
    {
      id: 'run-2',
      tourName: 'Hoi An Walking Tour',
      operatorName: 'Heritage Guides',
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      guideName: 'Guide Linh',
      latitude: 15.8801,
      longitude: 108.3380,
      companyId: 'company-demo',
    } as any,
  ];
}
