export const AVAILABLE_TRANSFORMS: { value: string; desc: string }[] = [
  { value: "truncateText(4000)", desc: "テキストを4000文字に切り詰め" },
  { value: "truncateText(2000)", desc: "テキストを2000文字に切り詰め" },
  { value: "truncateText(8000)", desc: "テキストを8000文字に切り詰め" },
  { value: 'filterByType("text")', desc: "テキスト素材だけ残す" },
  { value: 'filterByType("image")', desc: "画像素材だけ残す" },
  { value: 'filterByType("data")', desc: "データ素材だけ残す" },
  { value: 'prependText("")', desc: "先頭にテキストを追加" },
  { value: "dataToText()", desc: "CSV/JSONデータをテキストに変換" },
  { value: "documentToText()", desc: "ドキュメントをテキストに変換" },
  { value: "imageUrlToBase64()", desc: "画像URLをBase64に変換" },
];

export const RECIPE_ICONS = ["📝", "📋", "🧪", "🔬", "⚗️", "✨", "🎯", "💡", "🔮", "📐", "🛠️", "🧩"];
