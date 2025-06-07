import { useTodayState } from "@/store/weekStore";
import { Badge } from "@/components/ui/badge"

export default function HeaderContent({ title }: { title?: string }) {
  const today = useTodayState((state) => state.today);
  const today2 = useTodayState((state) => state.today2);
  // console.log(today.text.split(""));
  // console.log(today2);

  return (
    <div className="h-full flex items-center p-2">
      <h2 className="flex-1">{title}</h2>
      <div className="h-full flex flex-wrap items-center justify-end">
        <Badge variant="secondary" className="mx-1 font-normal" dir={today.dir}>{today.text}</Badge>
        <Badge variant="secondary" className="mx-1 font-light text-primary/75 bg-primary/10" dir={today.dir}>{today2.text}</Badge>
      </div>
    </div >
  );
}
