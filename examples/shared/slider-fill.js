/** Syncs --qa-slider-fill for WebKit range inputs (CSS-only fill gradient). */
export function bindSliderFill(slider) {
  const update = () => {
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 100);
    const value = Number(slider.value);
    const percent = ((value - min) / (max - min)) * 100;
    slider.style.setProperty("--qa-slider-fill", `${percent}%`);
  };

  slider.addEventListener("input", update);
  update();
  return update;
}
