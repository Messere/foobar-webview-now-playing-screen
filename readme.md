# Now playing screen for foobar2000

The goal of this little project was to create a "now playing" screen that could
be displayed on big TV screens while foobar is playing. To avoid screen damage
(burn-in) from statically displayed elements, the information on screen is animated
and changes its position periodically. Background can be either static color
(i.e., black) or animated, colorful fog.

![example now playing screen](screen.png)

## Installation

Make sure you have Windows version of [foobar2000](https://www.foobar2000.org/) installed,
toghether with [foo_webview2 plugin](https://www.foobar2000.org/components/view/foo_webview2).

Download this repository to some directory, then configure `foo_webview2` and
point it to `now-playing.html` template. You can display now playing screen using
 `View->WebView2` or add WebView2 as an UI element. See
 [this](https://github.com/jecassis/foo_uie_webview) for details on `foo_webview2`.

## Features

* All metadata is optional; fields that have no value simply disappear from screen.
* It works well with local playback, streaming and playback from one
foobar2000 instance to anoter.
* Nice animation of spinning CD when audio is playing.
* Simple auto-generated "artwork" placeholder when no artwork is available (note:
this won't work if you have default artwork set in foobar2000).
* Custom CD artwork is supported; if no CD artwork is availabe, substitute is
generated based on main artwork (again - this works only if foobar2000 is not
confugured to provide its own fallback artwork).
* As it was meant as a non-interactive big screen display, there are only two
interactive element: playback button toggles between pause and play on click and
time display toggles between elapsed and remaining time on click (but only if
remaining time is known).
* Simple customization: edit the template and add your own elements. A dedicated
attribute `data-format` accepts foobar2000 formatting script and displays/updates
it automatically. For example:
    ```html
    <span data-format="[%album artist%]"></span>
    ```
    will display and update `album artist` information from foobar2000. No JavaScript
    modifications required.

## Configuration

A section of configurable parameters is included at the top of the template file in
`:root` CSS element:

```css
:root {
    /* configurable options */
    color-scheme: dark;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-variant: small-caps;
    --alignment: flip; /* flip, left, or right */
    --inverse-layout: false;
    --default-time-display: elapsed; /* elapsed or remaining */
    --flip-duration: 45s;
    --cd-spin-duration: 5s;
    --cd-hide-duration: 1.5s;
    --color-mute-factor: 0.3;
    --cover-stretch-threshold: 0.10;
    --cover-generator-str-len: 5;
    --cover-generator-char-scale-factor: 0.7;
    --bg-static-color: Canvas;
    --bg-fog-enabled: true;
    --bg-fog-highlight-color: #310c1d;
    --bg-fog-midtone-color: #c03f26;
    --bg-fog-lowlight-color: #3e1010;
    --bg-fog-base-color: #a02424;
}
```

| option                              | information                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| color-scheme                        | `dark` or `light`, can also be `dark light` for automatic selection according to your system settings                 |
| font-family                         | see [font-family CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-family)     |
| font-variant                        | see [font-variant CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant)   |
| --alignment                         | `left` for cover on left, meta on right, `right` for reverse, `flip` for animation between `left` and `right`         |
| --inverse-layout                    | if `true` then cover art switches sides with metadata.                                                                |
| --default-time-display              | `elapsed` or `remaining` (note that `remaining` falls back to `elapsed` if total time is unknown, i.e. for streaming) |
| --flip-duration                     | time between information on screen flip from side to side                                                             |
| --cd-spin-duration                  | the larger the value, the slower CD art spins while playing                                                           |
| --cd-hide-duration                  | how quickly CD art shows/hides when starting/stopping playback                                                        |
| --color-mute-factor                 | transparency of some text elements (i.e. text in parentheses)                                                         |
| --cover-stretch-threshold           | if cover width/hight ratio is smaller that this, cover is stretched                                                   |
| --cover-generator-str-len           | number of characters that is taken to generate automatic cover art                                                    |
| --cover-generator-char-scale-factor | ratio of the size between consecutive characters                                                                      |
| --bg-fog-enabled                    | enable (`true`) or disable (`false`) background fog (can be GPU intensive on slower machines and higher resolutions)  |
| --bg-fog-*-color                    | colors of the fog, see [Vanta.js fog](https://www.vantajs.com/?effect=fog) for details and interactive customization  |

### Country flags

To properly display a country flag, the template expects `COUNTRY` tag with
two letter country code ([ISO 3166-1 alpha-2](https://www.iso.org/obp/ui/)).

Three-letter codes, as well as official English country names and a few popular common
names, are translated to two-letter standard on the fly.
If your case is not handled well, you can add it to [countries.js](countries.js).

## Acknowledgements

This template uses the following open-source components:

* MIT licensed fog effect from [tengbao/vanta](https://github.com/tengbao/vanta)
* MIT licensed three.js library from [mrdoob/three.js](https://github.com/mrdoob/three.js/)
* MIT licensed SVG flags from [lipis/flag-icons](https://github.com/lipis/flag-icons)

All this was possible thanks to [foobar2000 player](https://www.foobar2000.org/)
and [foo_webview2 plugin](https://github.com/jecassis/foo_uie_webview).

## License

This code is [MIT licensed](license.txt).