import { Card, CardContent, Box } from "@mui/material";
import { TrendingUp, Activity, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PortfolioMetricsCard({
  sharpe,
  volatility,
  annualReturn,
}: {
  sharpe: number;
  volatility: number;
  annualReturn: number;
}) {
  const metrics = [
    {
      label: "5Y Annual Return",
      value: `${(annualReturn * 100).toFixed(2)}%`,
      icon: Shield,
      description: "Annualised return for portfolio over last 5Y",
    },
    {
      label: "5Y Sharpe Ratio",
      value: sharpe.toFixed(2),
      icon: TrendingUp,
      description: "Risk-adjusted return",
    },
    {
      label: "5Y Volatility",
      value: `${(volatility * 100).toFixed(2)}%`,
      icon: Activity,
      description: "Annualized risk",
    },
  ];

  return (
    <Box
      display="flex"
      gap={2} // spacing between cards
      flexWrap="wrap" // allow wrapping on very small screens
      justifyContent="space-between"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{ flex: "1 1 30%" }} // each card takes ~1/3 of row
        >
          <Card
            sx={{
              borderRadius: 3, // rounded corners
              boxShadow: 3,
              height: "100%", // equal height
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <span style={{ fontSize: 12, color: "#666" }}>{m.label}</span>
                <m.icon size={16} color="#666" />
              </Box>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{m.description}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}
