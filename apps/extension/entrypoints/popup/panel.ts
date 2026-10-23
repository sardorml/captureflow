// The panel's rows — source, camera, mic, screenshot target — are one control
// at four jobs, so they share a box rather than four copies that drift apart.
// The source row paints its own fill over PANEL_ROW; the rest take the grey.
export const PANEL_ROW =
  "flex h-[50px] items-center gap-2 rounded-[14px] px-4 text-[15px] font-semibold";
export const PANEL_ROW_GREY = `${PANEL_ROW} border border-separator bg-surface`;

// Menus open beside the card in the overlay: a flat list of icon rows on the
// card's own colour, the chosen one tinted with a trailing check, the hovered
// one in the accent. Hover beats chosen: the tint is too pale in light mode
// for the white hover text. Hover is the browser's own, not the tracked
// data-hovered, which can outlive the pointer in this frame; keyboard focus
// paints like hover, plain focus doesn't, since the last row under the
// pointer keeps it.
export const MENU_POPOVER =
  "w-[300px] overflow-hidden rounded-[14px] border border-separator bg-background p-0 shadow-none";
// Past the card's own edge and inset, plus a sliver of page between the two.
export const MENU_OFFSET = 28;
export const MENU_LIST = "gap-0 p-0";
export const MENU_ITEM =
  "h-12 gap-3 rounded-none px-5 pe-10 text-base whitespace-nowrap text-foreground data-[selected=true]:bg-(--cf-selected) data-[focus-visible=true]:bg-accent data-[focus-visible=true]:text-white hover:bg-accent hover:text-white data-[selected=true]:data-[focus-visible=true]:bg-accent data-[selected=true]:hover:bg-accent";
// A disc with the check cut into it on the chosen row, nothing elsewhere.
export const MENU_CHECK =
  "start-auto end-4 size-6 rounded-full [&_svg]:size-3 [.menu-item[data-selected=true]_&]:bg-foreground [.menu-item[data-selected=true]_&]:text-background";
