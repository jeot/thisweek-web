import { useWeekState } from "@/store/week";
import { Badge } from "@/components/ui/badge"

export default function SidebarLayout({ }: {}) {
  const today = useWeekState((state) => state.today);
  const today2 = useWeekState((state) => state.today2);
  // console.log(today.text.split(""));
  // console.log(today2);

  return (
    <div className="h-full flex flex-wrap items-center justify-end">
      <Badge variant="default" className="mx-1" dir={today.dir}>{today.text}</Badge>
      <Badge variant="secondary" className="mx-1" dir={today.dir}>{today2.text}</Badge>
    </div>
  );
}
