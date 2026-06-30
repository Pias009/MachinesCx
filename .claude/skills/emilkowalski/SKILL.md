---
name: emilkowalski
description: >
  Emil Kowalski UI style guide and library setup. Use this skill whenever the user wants to:
  install or use Vaul (drawer), Sonner (toasts), or cmdk (command menu); build components
  with spring-physics animations, minimal design, or polished microinteractions; replicate
  the design aesthetic from emilkowalski.com, craft.mxstbr.com, or similar indie hacker
  portfolios; add gesture-aware overlays, dismissable sheets, or cmd+k palettes; or asks
  "Emil Kowalski style", "make it feel like Vaul", "sonner-style toasts", "cmdk palette".
  Trigger proactively whenever someone describes wanting animations that feel "natural",
  "springy", "delightful", or "like native apps".
---

# Emil Kowalski — Style Guide & Library Setup

Emil Kowalski (@emilkowalski_) is an indie designer/developer whose libraries (Vaul, Sonner,
cmdk) set the bar for polished, minimal, spring-driven React UI. This skill covers two things:

1. **Installing and using his libraries** correctly in a Next.js / React project
2. **Building in his aesthetic** — spring animations, minimal surfaces, precise microinteractions

---

## 1. His Libraries

### Vaul — Bottom Drawer

```bash
npm install vaul
```

```tsx
import { Drawer } from 'vaul';

export function MyDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button>Open</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-full max-h-[96%] flex-col rounded-t-[10px] bg-zinc-100">
          <div className="flex-1 rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
            {/* content */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Key Vaul details:
- The `h-1.5 w-12` drag handle bar is his signature — always include it
- Use `rounded-t-[10px]` (not `rounded-t-lg`) — he uses precise pixel values
- `Drawer.Root` accepts `snapPoints={[0.4, 1]}` for multi-stop drawers
- `shouldScaleBackground` on `<body>` scales the page when the drawer opens (set `data-vaul-drawer-wrapper` on your main wrapper div)

### Sonner — Toasts

```bash
npm install sonner
```

```tsx
// In your root layout
import { Toaster } from 'sonner';
<Toaster position="bottom-right" />

// Anywhere in your app
import { toast } from 'sonner';
toast('Event has been created');
toast.success('Profile updated');
toast.error('Something went wrong');
toast.promise(saveSettings(), {
  loading: 'Saving...',
  success: 'Settings saved',
  error: 'Could not save',
});
```

Key Sonner details:
- Default position is `bottom-right` — only change it if there's a strong reason
- Keep toast copy short — max one short sentence
- Use `toast.promise` for async actions; never manually show loading → success toasts
- `richColors` prop on `<Toaster>` enables semantic color coding
- `expand` prop lets users expand the stack to see all toasts

### cmdk — Command Menu

```bash
npm install cmdk
```

```tsx
import { Command } from 'cmdk';

export function CommandMenu() {
  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
      <Command.Input placeholder="Type a command or search…" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Pages">
          <Command.Item onSelect={() => router.push('/dashboard')}>
            Dashboard
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

Key cmdk details:
- Trigger with `⌘K` (Mac) / `Ctrl+K` (Windows) — wire this up in a `useEffect`
- `Command.Dialog` handles the modal — don't build your own wrapper
- Items filter automatically based on `Command.Input` value
- The `value` prop on `Command.Item` controls what it matches against during search

---

## 2. His Visual & Animation Language

### Spring easing (not cubic-bezier guessing)

His animations feel *physical* because they use spring physics, not hand-tuned curves.
In CSS, approximate with:

```css
transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
```

In Framer Motion (his preferred tool for one-off animations):

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

Spring recipe for different feels:
- **Snappy** (dialogs, menus): `stiffness: 400, damping: 30`
- **Natural** (drawers, sheets): `stiffness: 300, damping: 30`
- **Floaty** (tooltips, popovers): `stiffness: 200, damping: 20`

### Scale + opacity enters (his signature)

Elements don't just fade in — they scale up from ~97% and fade simultaneously:

```tsx
initial={{ opacity: 0, scale: 0.97 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.97 }}
```

### Color palette philosophy

- Backgrounds: `zinc-50`, `zinc-100`, `white` — never pure gray
- Borders: `zinc-200` (light mode), `zinc-800` (dark mode) — always subtle
- Text: `zinc-900` primary, `zinc-500` secondary, `zinc-400` placeholder
- Avoid blue-tinted grays; the `zinc` scale is intentional
- Dark mode: background `zinc-950`, surfaces `zinc-900`, borders `zinc-800`

### Typography

- System font stack or Geist — no display fonts
- Body: 14px / `text-sm`, tight line-height `leading-5`
- Labels and captions: `text-xs text-zinc-500`
- No font-weight heroics — `font-medium` for emphasis, `font-semibold` sparingly

### Spacing & sizing

He uses precise values, not Tailwind defaults blindly:
- Border radius: `rounded-[10px]` for cards/drawers, `rounded-md` for buttons, `rounded-full` for pills/handles
- Padding in cards: `p-4` or `p-5` — consistent, not mixed
- Gaps: `gap-2` between tight items, `gap-4` between sections

### Interactive states

```css
/* Buttons */
hover: bg-zinc-100 (light) / bg-zinc-800 (dark)
active: scale-[0.98] — he almost always adds a tiny press scale
focus-visible: ring-2 ring-zinc-900 ring-offset-2

/* Links / nav items */
hover: text-zinc-900 (from zinc-500) with transition-colors duration-150
```

---

## 3. Component Recipes

### His-style card

```tsx
<div className="rounded-[10px] border border-zinc-200 bg-white p-5 shadow-sm">
  {/* content */}
</div>
```

### His-style button

```tsx
<button className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98]">
  Click me
</button>
```

### His-style input

```tsx
<input
  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
/>
```

---

## 4. Common Patterns & Gotchas

- **Never use `overflow: hidden` on the drawer wrapper** — it breaks the drag gesture
- **Always animate `layout` on list items** that reorder (Framer Motion `layout` prop)
- **Don't use `@radix-ui/react-dialog` directly** when using cmdk — `Command.Dialog` already wraps it
- **Sonner and Vaul can coexist** — just make sure `<Toaster>` is in the layout, not inside the drawer
- **`shouldScaleBackground`** on Vaul requires a `data-vaul-drawer-wrapper` attribute on your root `<div>` — without it the scale effect silently does nothing
- When wrapping Vaul in a sheet/modal abstraction, keep `Drawer.Portal` — removing it causes z-index issues

---

## 5. When to reach for each library

| Need | Use |
|------|-----|
| Mobile-friendly overlay / panel | Vaul |
| Success / error / async feedback | Sonner |
| Search, navigation, quick actions | cmdk |
| Simple modal dialog | Radix `Dialog` (not Vaul) |
| Tooltip | Radix `Tooltip` |
| Dropdown menu | Radix `DropdownMenu` |

Vaul is for *drawer* patterns specifically — don't use it as a general modal replacement.
