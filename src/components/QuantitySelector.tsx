export default function QuantitySelector({ quantity, setQuantity }: any) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg w-36 h-12 mb-4">
      <button
        type="button"
        onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
        className="w-12 h-full text-xl font-medium"
      >
        -
      </button>
      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(Math.max(1, +e.target.value))}
        className="w-12 text-center border-x border-gray-200 outline-none"
      />
      <button
        type="button"
        onClick={() => setQuantity((q: number) => q + 1)}
        className="w-12 h-full text-xl font-medium"
      >
        +
      </button>
    </div>
  );
}
