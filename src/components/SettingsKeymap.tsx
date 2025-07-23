import { Switch } from "./ui/switch";
import { useKeymapsState } from "@/store/keymapStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { KeyMap, KEYMAPS } from '@/lib/keymaps';
import { Badge } from "@/components/ui/badge"

export function SettingsKeymap() {
  const keymap = useKeymapsState((state) => state.keymap);
  const setKeymap = useKeymapsState((state) => state.setKeymap);

  function KeysDisplay({ keys, seperator }: { keys: Array<string>, seperator: string }) {
    return (keys.map((value, i) => {
      return (<><Badge variant="secondary" className="font-semibold rounded-xs">
        {value
          .replace("escape", "Escape")
          .replace("space", "Space")
          .replace("up", "Up")
          .replace("down", "Down")
          .replace("right", "Right")
          .replace("left", "Left")
          .replace("ctrl", "Ctrl")
          .replace("shift", "Shift")
          .replace("+", " + ")}
      </Badge>
        {(i !== keys.length - 1) && <span>{seperator}</span>}
      </>)
    }))
  }

  function KeymapTable({ keymaps }: { keymaps: Array<KeyMap> }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] font-bold text-ring">Key Shortcut</TableHead>
            <TableHead className="font-bold text-ring">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            keymaps.map((value, index) => {
              const keys = Array.isArray(value?.key) ? value.key :
                (value.key !== undefined ? [value.key] : undefined);
              const sequence = value.sequence;
              return (
                <TableRow key={`key-${value.group}-${index}`}>
                  <TableCell className="font-base">
                    {keys && <KeysDisplay key={`keys-${value.group}-${index}`} keys={keys} seperator="&nbsp;or&nbsp;" />}
                    {sequence && <KeysDisplay key={`sequence-${value.group}-${index}`} keys={sequence} seperator="&nbsp;" />}
                  </TableCell >
                  <TableCell>{value.desc}</TableCell>
                </TableRow >
              )
            })
          }
        </TableBody >
      </Table>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline space-x-5">
        <h2 className="mt-2">General Shortcuts</h2>
        <Switch checked={keymap.generalShortcutsEnabled}
          onCheckedChange={() =>
            setKeymap({ ...keymap, generalShortcutsEnabled: !keymap.generalShortcutsEnabled })
          }
        />
      </div>

      <KeymapTable keymaps={KEYMAPS.filter((value) => value.group === "GENERAL")} />

      <div className="flex items-baseline space-x-5">
        <h2 className="mt-4">Vim Mode Shortcuts</h2>
        <Switch checked={keymap.vimModeShortcutsEnabled}
          onCheckedChange={() =>
            setKeymap({ ...keymap, vimModeShortcutsEnabled: !keymap.vimModeShortcutsEnabled })
          }
        />
      </div>

      <KeymapTable keymaps={KEYMAPS.filter((value) => value.group === "VIMMODE")} />

    </div >
  );
}
