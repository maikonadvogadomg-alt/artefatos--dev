import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// PWABuilder API — gera APK/ZIP de um PWA a partir da URL
// Proxy server-side para evitar CORS e rate-limit do browser
router.post("/generate-apk", async (req: Request, res: Response) => {
  const { url, packageId, name, themeColor, backgroundColor } = req.body as {
    url?: string;
    packageId?: string;
    name?: string;
    themeColor?: string;
    backgroundColor?: string;
  };

  if (!url || !url.startsWith("https://")) {
    res.status(400).json({ error: "URL HTTPS obrigatória (ex: https://meuapp.replit.app)" });
    return;
  }

  const slug = (name ?? "Meu App")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20) || "meuapp";

  const pkg = packageId ?? `com.app.${slug}`;

  // Payload para a API do PWABuilder (Microsoft Azure Functions)
  const payload = {
    site: { url },
    android: {
      packageId: pkg,
      name: name ?? "Meu App",
      launcherName: (name ?? "Meu App").split(" ")[0],
      themeColor: themeColor ?? "#0d1520",
      backgroundColor: backgroundColor ?? "#0d1520",
      startUrl: "/",
      iconUrl: `${url.replace(/\/$/, "")}/icon-512.png`,
      display: "standalone",
      orientation: "default",
      versionCode: 1,
      versionName: "1.0.0",
      signing: {
        file: null, alias: null, fullName: null,
        organization: null, organizationalUnit: null,
        countryCode: null, keyPassword: null, storePassword: null,
      },
    },
  };

  logger.info({ url, pkg }, "generate-apk: calling PWABuilder API");

  try {
    const upstream = await fetch(
      "https://pwabuilder-apk.azurewebsites.net/api/GenerateZip",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000), // 2 min timeout
      }
    );

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => upstream.statusText);
      logger.warn({ status: upstream.status, text }, "generate-apk: upstream error");
      res.status(502).json({
        error: `PWABuilder retornou ${upstream.status}`,
        detail: text.slice(0, 300),
      });
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "application/zip";
    const filename = `${slug}-apk.zip`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const buf = await upstream.arrayBuffer();
    res.send(Buffer.from(buf));

    logger.info({ filename, bytes: buf.byteLength }, "generate-apk: done");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "timeout ou falha de rede";
    logger.error({ err: msg }, "generate-apk: fetch failed");
    res.status(503).json({ error: `Falha ao gerar APK: ${msg}` });
  }
});

export default router;
