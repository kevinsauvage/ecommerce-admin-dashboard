export default function Heading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold md:text-3xl lg:text-4xl">{title}</h1>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
