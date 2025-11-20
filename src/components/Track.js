function Track() {
  return (
    <div className="flex flex-col gap-2 w-40">
      {[1, 2, 3, 4].map((slot) => (
        <div
          key={slot}
          className="h-16 bg-[#648DB3] rounded shadow-md hover:bg-[#79b2c7] hover:shadow-lg"
        ></div>
      ))}
    </div>
  );
}

export default Track;
