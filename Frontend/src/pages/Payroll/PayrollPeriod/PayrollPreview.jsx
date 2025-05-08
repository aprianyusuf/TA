import React from "react";

import { format, sub } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CheckAuthorization from "@/templates/CheckAuthorization";

const PayrollPreview = () => {
    

    return (
        <>
            <Card className="p-2">
                <CardHeader className="p-6 flex justify-center text-center">
                    <CardTitle>Payroll Detail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-100 p-4 rounded mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">Name :</span>
                                <div className="px-3 font-bold text-lg">Aprian</div>
                                </div>
                                <div className="text-right">
                                <div className="flex items-baseline gap-2 text-green-600 font-bold text-2xl">
                                    <div>THP Rp</div>
                                    <div>0</div>
                                </div>
                                <div className="flex items-baseline gap-2 font-bold text-sm">
                                    <div>Base Salary Rp</div>
                                    <div>0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-center font-bold text-lg border-b bg-gray-200 py-2">Benefit</h3>
                        <table className="w-full text-sm text-center">
                        <thead className="bg-blue-300">
                            <tr>
                            <th className="text-center py-1">Item</th>
                            <th className="text-center py-1">Percentage</th>
                            <th className="text-center py-1">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                            ['JHT', '0%', '0'],
                            ['JKK', '0%', '0'],
                            ['JKM', '0%', '0'],
                            ['JP', '0%', '0'],
                            ['KS', '0%', '0'],
                            ].map(([item, percentage, amount], idx) => (
                            <tr key={idx} className="bg-yellow-100">
                                <td className="py-1">{item}</td>
                                <td>{percentage}</td>
                                <td>{amount}</td>
                            </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100">
                            <td className="font-bold py-2" colSpan={2}>Total</td>
                            <td className="font-bold">0</td>
                            </tr>
                        </tfoot>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-center font-bold text-lg border-b bg-gray-200 py-2">Deduction</h3>
                        <table className="w-full text-sm text-center">
                        <thead className="bg-blue-300">
                            <tr>
                            <th className="text-center py-1">Item</th>
                            <th className="text-center py-1">Percentage</th>
                            <th className="text-center py-1">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                            ['JHT', '0%', '0'],
                            ['JKK', '0%', '0'],
                            ['JKM', '0%', '0'],
                            ['JP', '0%', '0'],
                            ['KS', '0%', '0'],
                            ['Tax', '0%', '0'],
                            ].map(([item, percentage, amount], idx) => (
                            <tr key={idx} className="bg-yellow-100">
                                <td className="py-1">{item}</td>
                                <td>{percentage}</td>
                                <td>{amount}</td>
                            </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100">
                            <td className="font-bold py-2" colSpan={2}>Total</td>
                            <td className="font-bold text-pink-600">0</td>
                            </tr>
                        </tfoot>
                        </table>
                    </div>
                    </div>
                </CardContent>
                </Card>

        </>
    );
};

export default CheckAuthorization({
    Component: PayrollPreview,
    menu: "MD00028",
});
