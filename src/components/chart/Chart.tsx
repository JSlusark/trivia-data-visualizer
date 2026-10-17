import { useState, useEffect, useMemo } from "react";
import { colorScheme, customiseColor } from "../../utils/colorUtils";
import type { TriviaQuestion } from "../../types";
import { filterData } from "../../utils/filterData";
import {
    BarChart,
    Bar,
    Legend,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Tailwind breakpoints in px
const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
};

/*   The base ratio logic:
  If we have more than 5 labels at 640px, rotation triggers.
  For larger screens, we scale the allowed number of visible labels
  proportionally to the width ratio vs the base breakpoint. */
const computeShouldRotate = (windowWidth: number, labelCount: number) => {
    const baseBreakpoint = breakpoints.sm;
    const baseLimit = 5;
/*
    Linear scaling formula:
    allowedLabels = baseLimit * (windowWidth / baseBreakpoint) */
    const allowedLabels = baseLimit * (windowWidth / baseBreakpoint);

    // Rotates if we have more labels than we can fit
    return labelCount > allowedLabels;
};

function Chart({
    data,
    selectedCategory,
    activeFilter,
}: {
    data: TriviaQuestion[];
    selectedCategory: string | null;
    activeFilter: string;
}) {
    // Memoized so the resize effect below only re-runs when the data actually changes
    const chartData = useMemo(
        () => filterData(data, selectedCategory, activeFilter),
        [data, selectedCategory, activeFilter]
    );
    // console.log("Filtered data:", chartData);

    // Tracks window width to decide if rotating values - might also avoid and use css later in some way
    const [rotateLabels, setRotateLabels] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const [overBar, setOverBar] = useState(false); // so that tooltip appears only when hovering on the bar instead

    useEffect(() => {
        const handleResize = () => {
            const labelCount = chartData.length;
            setWindowWidth(window.innerWidth);
            // console.log("Window width:", window.innerWidth);
            const shouldRotate = computeShouldRotate(
                window.innerWidth,
                labelCount
            );
            setRotateLabels(shouldRotate);
        };

        handleResize(); // runs on every mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [chartData]);

    return (
        <div className="w-full flex justify-center ">
            <ResponsiveContainer
                className="max-w-4xl"
                width="100%"
                height={450}>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 50,
                        left: 0,
                        bottom: rotateLabels ? 100 : 60,
                    }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colorScheme.base200}
                    />

                    <XAxis
                        dataKey="value"
                        tickFormatter={(value: string) => {
                            let formatted = value;
                            const title = value.split(":");
                            if (title[1]) {
                                formatted =
                                    title[0].trim().substring(0, 3) +
                                    `: ` +
                                    title[1]; // "Ent + rest of string"
                            }

                            // Base trimming logic for rest
                            const limit = rotateLabels ? 17 : 25; // shows more chars if not rotated as rotation is triggered most times
                            return formatted.length > limit
                                ? formatted.slice(0, limit) + "…"
                                : formatted;
                        }}
                        tick={{
                            fontSize: 12,
                            fill: `${customiseColor(activeFilter, "active")}`,
                        }}
                        interval={rotateLabels && windowWidth < 500 ? 1 : 0}
                        angle={rotateLabels ? -45 : 0}
                        textAnchor={rotateLabels ? "end" : "middle"}
                        height={10}
                    />

                    <YAxis
                        tick={{
                            fontSize: 12,
                            fill: colorScheme.baseContent,
                        }}
                        allowDecimals={false}
                    />

                    <Tooltip
                        wrapperStyle={{
                            visibility: overBar ? "visible" : "hidden",
                        }}
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                            backgroundColor: colorScheme.base100,
                            borderRadius: "8px",
                            boxShadow: `0 2px 8px ${colorScheme.base300}`,
                            textAlign: "left",
                            fontSize: "0.8rem",
                        }}
                        labelStyle={{
                            color: colorScheme.baseContent,
                            fontWeight: "bold",
                            textAlign: "left",
                            fontSize: "0.85rem",
                        }}
                        formatter={(value) => ["Questions: " + (value ?? 0)]}
                    />

                    <Legend
                        align="center"
                        verticalAlign="top"
                        layout="horizontal"
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{
                            paddingBottom: "30px",
                            textAlign: "center",
                            width: "100%",
                        }}
                        formatter={() => {
                            return !selectedCategory
                                ? `Total questions by ${activeFilter}`
                                : `Questions ${
                                      activeFilter === "difficulty"
                                          ? `by ${activeFilter}`
                                          : ""
                                  } in ${selectedCategory}`;
                        }}
                    />

                    <Bar
                        dataKey="count"
                        fill={customiseColor(activeFilter, "idle")}
                        activeBar={
                            overBar
                                ? {
                                      fill: customiseColor(
                                          activeFilter,
                                          "active"
                                      ),
                                  }
                                : {}
                        }
                        background={false}
                        animationDuration={500}
                        onMouseEnter={() => setOverBar(true)}
                        onMouseLeave={() => setOverBar(false)}
                        radius={[5, 5, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default Chart;
