import { useEffect, useMemo } from "react";

export default function useStyles(stylesArray) {
  const stylesKey = useMemo(() => JSON.stringify(stylesArray), [stylesArray]);

  useEffect(() => {
    const links = [];

    stylesArray.forEach((href) => {
      let link = document.querySelector(`link[href="${href}"]`);

      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }

      links.push(link);
    });

    return () => {
      links.forEach((link) => {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [stylesArray, stylesKey]);
}
