import React from "react";
import { useMarketData } from "../hooks/useMarketData";
import GlobalClocks from "./Market/GlobalClocks";
import StockRadar from "./Market/StockRadar";
import MarketNews from "./Market/MarketNews";
import MarketError from "./Market/MarketError";

export default function MarketOverview() {
  const { marketData, loading, errorConfig } = useMarketData();

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        Carregando radar do mercado...
      </div>
    );
  }

  if (errorConfig.hasError) {
    return <MarketError errorConfig={errorConfig} />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr 300px",
        gap: "2rem",
        padding: "1rem",
        color: "#fff",
        maxWidth: "1600px",
        margin: "0 auto",
        alignItems: "start",
      }}
    >
      <GlobalClocks statuses={marketData.marketStatuses} />

      <StockRadar stocks={marketData.stocks} />

      <MarketNews news={marketData.news} />
    </div>
  );
}
