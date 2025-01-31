import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BurndownChartProps {
    sprintId: string;
    startDate: Date;
    endDate: Date;
    totalPoints: number;
    completedPoints: number;
    dailyProgress: Record<string, number>;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({
    startDate,
    endDate,
    totalPoints,
    completedPoints,
    dailyProgress
}) => {
    // Generate data for the burndown chart
    const generateBurndownData = () => {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const pointsPerDay = totalPoints / days.length;
        
        return days.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const actualRemaining = totalPoints - (dailyProgress[dateStr] || 0);
            const idealRemaining = totalPoints - (pointsPerDay * (index + 1));
            
            return {
                date: dateStr,
                remainingPoints: actualRemaining,
                idealPoints: Math.max(0, idealRemaining)
            };
        });
    };

    const data = generateBurndownData();

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sprint Burndown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'MMM d')}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="remainingPoints"
                                stroke="#8884d8"
                                name="Actual"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="idealPoints"
                                stroke="#82ca9d"
                                name="Ideal"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Sprint Progress Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Total Points</p>
                        <p className="text-2xl font-semibold">{totalPoints}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-semibold">{completedPoints}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className="text-2xl font-semibold">{totalPoints - completedPoints}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 