interface FeatureListProps {
  title: string;
  features: string[];
  bulletColor?: string;
  className?: string;
}

export function FeatureList({
  title,
  features,
  bulletColor = "bg-muted",
  className = "",
}: FeatureListProps) {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-2 h-2 ${bulletColor} rounded-full`}></div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
