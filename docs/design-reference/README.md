# Design reference index

These files are the **visual source of truth** for ConnectX. Do not delete them until the React implementation has been verified against them.

## Design systems (two competing documents)

| Path | Likely original name | Role |
| --- | --- | --- |
| `connectx_universe/DESIGN.md` | `DESIGN(1).md` | Universe system. YAML tokens match the HTML prototypes. Prose tokens do **not**. |
| `connectx_modern_social/DESIGN.md` | `DESIGN.md` | Modern Social system. Different canvas, accents, spacing, and Plus Jakarta–only type. |

Canonical implementation tokens are decided in `docs/frontend-architecture.md`.

## HTML prototypes (Stitch / Google AIDA)

| Folder | Screen | Form factor |
| --- | --- | --- |
| `connectx_dynamic_home_feed` | Home feed + composer + file/audio posts | Desktop rail |
| `connectx_mobile_dynamic_home_feed` | Home feed + For You / Following / Spaces | Mobile + bottom nav |
| `connectx_curated_explore` | Explore filters, spotlight, bento | Desktop rail |
| `connectx_mobile_universal_create` | Create Studio “Share Anything” sheet | Mobile overlay |
| `connectx_mobile_universal_file_picker` | Universal Drive | Mobile |
| `connectx_mobile_space_community_hub` | Motion & Spatial Guild | Mobile |
| `connectx_creator_profile_social_vault` | Creator profile / social vault | Desktop-ish |
| `connectx_messages_universal_sharing` | Chat + attachments + poll | Desktop rail |
| `connectx_post_detail_interactive_comments` | Post detail + comments | Desktop rail |
| `connectx_notification_center_social_graph` | Notifications + social graph | Mobile + bottom nav |
| `connectx_universal_cross_sharing_social_graph` | Share sheet / social graph | Mobile |
| `connectx_universal_file_viewer_ai_assistant` | Document viewer + Ask AI | Desktop rail |
| `connectx_live_video_call_real_time_sharing` | Live call + in-call files | Desktop |
| `connectx_brand_mark` | Brand mark SVG | Asset |

## Screenshots

No local screenshot files were found in this repository. Prototype media currently lives on `lh3.googleusercontent.com` / AIDA URLs and must be replaced with local assets before production.

## Brand mark

`connectx_brand_mark/code.html` is an SVG: interlocking C/X, violet–blue–cyan stroke, magenta crossbar, canvas `#121624`.
