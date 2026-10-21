import { ImageResponse } from "next/og";
export const alt = "DORIDA — Journal aus Wien";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#f6f3ec", color: "#123d42", padding: 90, borderBottom: "18px solid #236b70" }}><div style={{ fontSize: 120, letterSpacing: -6 }}>DORIDA</div><div style={{ fontSize: 30, marginTop: 25 }}>Journal aus Wien</div><div style={{ fontSize: 24, marginTop: 70 }}>Menschen · Kultur · Politik</div></div>, size);
}
