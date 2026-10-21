import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const sourceUrl = new URL(
        `../src/${specifier.slice(2)}.ts`,
        import.meta.url,
      );

      return nextResolve(sourceUrl.href, context);
    }

    return nextResolve(specifier, context);
  },
});