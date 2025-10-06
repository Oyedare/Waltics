interface NetworkExplainerProps {
  title: string;
  description: string;
  links?: { label: string; url: string }[];
  disclaimer?: string;
  logoUrl?: string;
  className?: string;
}

export function NetworkExplainer({
  title,
  description,
  links = [],
  disclaimer,
  logoUrl,
  className = "",
}: NetworkExplainerProps) {
  return (
    <div className={`p-4 sm:p-6 border rounded-lg h-full ${className}`}>
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${title} logo`}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
          />
        )}
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
        <p className="leading-relaxed">{description}</p>

        {links.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium text-foreground text-xs sm:text-sm block">
              More about {title.split(" ")[0]}:
            </span>
            <div className="flex flex-wrap gap-2">
              {links.map((link, index) => (
                <span key={index} className="flex items-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline text-xs sm:text-sm"
                  >
                    {link.label}
                  </a>
                  {index < links.length - 1 && (
                    <span className="mx-1 text-muted-foreground">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {disclaimer && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs leading-relaxed">
              <span className="font-medium text-foreground">
                Dashboard Disclaimer:
              </span>{" "}
              {disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
