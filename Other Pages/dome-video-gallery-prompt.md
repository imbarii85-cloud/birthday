# 🎥 3D Dome Video Gallery — Prompt (Vanilla HTML/CSS/JS Version)

Yeh React Bits ke **DomeGallery** component jaisa hi ek immersive **3D sphere/dome gallery** chahiye — lekin **images ki jagah videos** ke liye, aur React ki bajaye **pure HTML + CSS + vanilla JavaScript** mein (kyunke website already plain HTML mein bani hui hai, React/Vite setup nahi hai).

## Core Idea

Ek 3D **dome/sphere shape** ho jisme saari videos (chote tiles ki tarah) uski curved surface par arranged hon — jaisay koi planetarium ya globe ho jisme har video ek "panel" ki tarah chipka ho. User mouse/touch se drag kar ke us dome ko **ghuma** sakay, jaise ek invisible globe ke andar khara ho kar chaaron taraf dekh raha ho.

## Layout aur Behavior

1. **Dome Structure**
   - Videos ko ek grid pattern mein calculate karke sphere ki curved surface par position kiya jaye (`rotateX` + `rotateY` + `translateZ` combination se, CSS 3D transforms).
   - Har video tile chota rounded-corner box ho, jisme thumbnail/poster frame dikhe (autoplay nahi — sirf poster image, taake performance acha rahay).

2. **Drag to Rotate**
   - Mouse drag (ya touch swipe mobile par) se pura dome horizontally aur halka vertically ghoom sakay.
   - Drag chhorne par thoda **inertia/momentum** ho — jaise ghumata hua globe dheere dheere ruke, achanak nahi.
   - Vertical rotation ek limit tak hi ho (bohot upar/neechay na ghoom sakay), taake user disoriented na ho.

3. **Click to Open/Play**
   - Kisi bhi video tile par click karo to woh **animate ho kar center mein bara ho jaye** (jaisay dome se "nikal ke" screen ke beech mein aa jaye) — smooth scale + position transition ke sath.
   - Bara hone ke baad video **actually play** honi chahiye (controls ke sath — chunke yeh ab video hai, image nahi).
   - Bahar (dark background/scrim) click karne ya close (✕) button se video wapas apni asal jagah pe **animate ho kar wapas chali jaye** aur pause ho jaye.
   - Jab koi video open ho, background dome ka scroll/drag temporarily lock ho jaye.

4. **Visual Style**
   - Background par ek **radial blur/vignette overlay** ho jo dome ke edges ko background mein smoothly fade karay (taake dome "floating in space" jaisa lagay, hard edges na dikhein).
   - Upar/neechay halka **edge-fade gradient** ho taake dome screen ke top/bottom se smoothly gayab ho.
   - Video tiles ka **corner radius** rounded ho, thumbnails default halke **muted/dim tone** mein hon (jaisay grayscale ya kam saturation) — sirf hover/focus par thora bright ho jayein, taake dome ek jaisa cohesive lagay, alag-alag colorful thumbnails se visually cluttered na ho.

## Data Structure

Har video ek object ho:
```js
{
  src: 'videos/apni-video.mp4',   // actual video file ka path
  poster: 'videos/thumb1.jpg',    // thumbnail jo dome par dikhega (video load hone se pehlay)
  title: 'Video ka title'          // optional, open hone par caption ke tor par dikhaya ja sakta hai
}
```
Naya video add karne ke liye sirf is array mein ek naya object add karna kaafi ho.

## Technical Notes (Vanilla Version)

- **CSS 3D transforms** (`perspective`, `transform-style: preserve-3d`, `rotateX`, `rotateY`, `translateZ`) se dome shape banegi — yeh sab plain CSS mein hoti hai, koi library nahi chahiye.
- **Drag/rotate logic** ke liye `pointerdown`, `pointermove`, `pointerup` events use kiye jayein (React wale component mein `@use-gesture/react` library thi, HTML version mein iski zaroorat nahi — native Pointer Events kaafi hain).
- **Inertia** (drag chhornay ke baad dheere dheere rukna) ek simple velocity-based `requestAnimationFrame` loop se implement ho sakta hai — friction lagate hue speed ko gradually zero tak le jana.
- Video tiles mein `<video>` tag `preload="none"` aur `poster` attribute use karo, taake sirf thumbnail load ho — asal video sirf tab load ho jab user click kar ke usay open kare (performance ke liye zaroori, kyunke videos images se bohot bhari hoti hain).
- Design website ke existing palette (navy background, gold/coral accents, cream text) ke sath match karay.

## Important Difference From the Original React Component

- Original `grayscale` prop images ke liye tha; video ke liye poster thumbnails par grayscale/dim filter use hoga (video khud grayscale nahi chalegi jab play ho).
- Original mein click par sirf image bari hoti thi; yahan click par video **bari bhi ho aur play bhi** honi chahiye, aur band karte waqt **pause** bhi honi chahiye.
- Chunke yeh HTML/vanilla project hai, koi `npm install` ya external package (`@use-gesture/react`) ki zaroorat nahi — sab kuch native browser APIs (Pointer Events, CSS transforms) se banega.
