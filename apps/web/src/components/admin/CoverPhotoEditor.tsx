"use client";
import { getMediaUrl } from "../../api/media";
type Cover = { coverImage: string; coverFocusX: number; coverFocusY: number; coverAlt: string; coverCaption: string; coverCredit: string };
export function CoverPhotoEditor({ value, onChange, disabled }: { value: Cover; onChange: (patch: Partial<Cover>) => void; disabled: boolean }) {
  const src = getMediaUrl(value.coverImage) ?? "";
  const style = { objectPosition: `${value.coverFocusX}% ${value.coverFocusY}%` };
  return <fieldset className="cover-photo-editor" disabled={disabled}>
    <legend>Кадрування прев’ю та опис фото</legend>
    <p>Оригінал не змінюється. У статті показуємо повне фото; фокус керує обрізанням у картках і на карті.</p>
    <div className="cover-photo-editor__previews">
      <figure><img src={src} alt="Повне фото у статті" /><figcaption>Стаття — повне фото</figcaption></figure>
      <figure><img src={src} style={style} alt="Кадрування картки" /><figcaption>Картка — 16:10</figcaption></figure>
      <figure><img src={src} style={style} alt="Кадрування на карті" /><figcaption>Карта — приклад кадрування</figcaption></figure>
    </div>
    <label>Фокус по горизонталі: {value.coverFocusX}%<input type="range" min="0" max="100" value={value.coverFocusX} onChange={e => onChange({ coverFocusX: Number(e.target.value) })} /></label>
    <label>Фокус по вертикалі: {value.coverFocusY}%<input type="range" min="0" max="100" value={value.coverFocusY} onChange={e => onChange({ coverFocusY: Number(e.target.value) })} /></label>
    <button type="button" onClick={() => onChange({ coverFocusX: 50, coverFocusY: 50 })}>Центрувати</button>
    <label>Альтернативний опис<input value={value.coverAlt} maxLength={300} onChange={e => onChange({ coverAlt: e.target.value })} placeholder="Що зображено на фото" /></label>
    <label>Підпис<input value={value.coverCaption} maxLength={500} onChange={e => onChange({ coverCaption: e.target.value })} /></label>
    <label>Автор / джерело фото<input value={value.coverCredit} maxLength={200} onChange={e => onChange({ coverCredit: e.target.value })} /></label>
    <button type="button" onClick={() => { if (window.confirm("Прибрати обкладинку зі статті? Оригінальний файл залишиться.")) onChange({ coverImage: "", coverAlt: "", coverCaption: "", coverCredit: "", coverFocusX: 50, coverFocusY: 50 }); }}>Прибрати обкладинку</button>
    <small>Зміни набудуть чинності після збереження статті.</small>
  </fieldset>;
}
