export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="motion-orb-one absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-green-soft blur-3xl" />
      <div className="motion-orb-two absolute right-[-10rem] top-36 h-96 w-96 rounded-full bg-blue-soft blur-3xl" />
      <div className="motion-orb-three absolute bottom-[-8rem] left-[35%] h-80 w-80 rounded-full bg-orange-soft blur-3xl" />

      <div className="absolute inset-x-0 top-28 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-line to-transparent" />
      <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-line to-transparent opacity-50" />
      <div className="absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-line to-transparent opacity-50" />
    </div>
  );
}
