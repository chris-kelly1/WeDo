import { DailyOverview } from '@/components/dashboard/DailyOverview';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { FriendActivity } from '@/components/dashboard/FriendActivity';

export default function Home() {
  return (
    <>
      <DailyOverview />
      <FriendActivity />
      <TodayTasks />
    </>
  );
}
