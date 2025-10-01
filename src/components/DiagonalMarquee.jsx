// src/components/DiagonalMarquee.jsx

const DiagonalMarquee = () => {
  const stickers = ["✈️", "🧳", "📒", "🗺️", "🌍", "🏖️", "🚆", "🛳️", "📸", "🏕️"];
  const stickerRow = [...stickers, ...stickers, ...stickers];

  return (
    <div className="relative overflow-hidden bg-red-600 py-8 -skew-y-3 transform-gpu">
      <div className="whitespace-nowrap">
        <div className="inline-block animate-marquee">
          {stickerRow.map((sticker, index) => (
            <span 
              key={index}
              className="mx-6 inline-block text-4xl transition-transform duration-300 hover:scale-125"
              style={{
                display: 'inline-block',
                transform: 'skewY(3deg)' // 💡 counter-skew each sticker to look upright
              }}
            >
              {sticker}
            </span>
          ))}
        </div>
      </div>

      <style jsx="true">{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }

        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DiagonalMarquee;
