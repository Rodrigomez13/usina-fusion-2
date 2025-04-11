"use client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarController,
  LineController,
} from "chart.js"
import { Chart } from "react-chartjs-2"

// Definir un tipo específico para interaction.mode
type InteractionMode = "y" | "index" | "x" | "dataset" | "point" | "nearest" | undefined

// Registrar TODOS los componentes necesarios de Chart.js, incluyendo los controladores
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
)

// Datos de ejemplo para el gráfico
const labels = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

const leadsData = [152, 242, 301, 351, 406, 470, 546, 619, 707, 792, 880, 1000, 1098, 1208, 1290, 1256, 1290, 1307]
const loadsData = [65, 113, 167, 196, 229, 277, 305, 357, 398, 446, 506, 555, 619, 642, 642, 645, 646, 666]
const costData = [2.3, 2.42, 2.68, 2.88, 3.01, 3.46, 3.56, 3.5, 3.42, 3.6, 3.8, 4.02, 4.25, 4.6, 4.77, 5.38, 5.78, 5.95]

export function ChartComponent() {
  const chartData = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Leads",
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        data: leadsData,
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Cargas",
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        data: loadsData,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Costo por Carga ($)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 2,
        fill: false,
        data: costData,
        yAxisID: "y1",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest" as InteractionMode, // Usar un valor válido con type assertion
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Cantidad",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Costo ($)",
        },
        min: 0,
        max: 12,
      },
    },
  }

  return (
    <div style={{ height: "400px" }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  )
}
