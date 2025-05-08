import React, { useRef } from "react";

import { format, sub } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CheckAuthorization from "@/templates/CheckAuthorization";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import PayrollApi from "@/apis/v1/PayrollApi/PayrollApi";
import { Spinner } from "@/components/atoms/Spinner";
import NotFound from "@/templates/NotFound";
import { Button } from "@/components/ui/Button";
import { PrinterIcon } from "lucide-react";

const PayrollPreview = () => {
    const { payrollperiodid, payrollid } = useParams();
    const pdfRef = useRef()

    const {
        data: detailPayroll,
        isLoading: isLoadingDetailPayroll,
        error: errorDetailPayroll,
    } = useCustomQuery({
        api: PayrollApi.showDetailPeriod,
        queryKey: ["showDetailPeriod", { id: payrollperiodid, periodId: payrollid }],
        queryParams: { id: payrollperiodid, periodId: payrollid },
    });

    const handlePrint = async () => {
        if (!pdfRef.current) return null;

        const element = pdfRef.current;
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF();
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
            (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(data, 'JPEG', 0, 10, pdfWidth, pdfHeight);
        pdf.save('print.pdf');
    }

    if (isLoadingDetailPayroll) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Spinner />
            </div>
        );
    }

    if (errorDetailPayroll || !detailPayroll.data.length) {
        return <NotFound message="Payroll not found" />;
    }

    return (
        <>
            <Card className="p-2">
                <CardHeader className="flex items-center justify-between p-6 text-center">
                    <CardTitle className="flex items-center justify-between w-full"><span>Payroll Detail</span>
                        <Button onClick={handlePrint} size="sm">
                            <PrinterIcon size={15} />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent ref={pdfRef}>
                    <div className="p-4 mb-4 bg-blue-100 rounded">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">Name :</span>
                                <div className="px-3 text-lg font-bold">{`${detailPayroll.data[0].firstName} ${detailPayroll.data[0].lastName}`}</div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-baseline gap-2 text-2xl font-bold text-green-600">
                                    <div>THP Rp</div>
                                    <div>{new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(detailPayroll.data[0].netPay)}</div>
                                </div>
                                <div className="flex items-baseline gap-2 text-sm font-bold">
                                    <div>Base Salary Rp</div>
                                    <div>{new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(detailPayroll.data[0].salary)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="py-2 text-lg font-bold text-center bg-gray-200 border-b">Benefit</h3>
                            <table className="w-full text-sm text-center">
                                <thead className="bg-blue-300">
                                    <tr>
                                        <th className="py-3 text-center">Item</th>
                                        <th className="py-1 text-center">Percentage</th>
                                        <th className="py-1 text-center">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailPayroll.data[0].bonuses.map(({ name, value }, idx) => (
                                        <tr key={idx} className="bg-yellow-100">
                                            <td className="py-1">{name}</td>
                                            <td>{value}</td>
                                            <td>{new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(value / 100 * detailPayroll.data[0].salary)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100">
                                        <td className="py-2 font-bold" colSpan={2}>Total</td>
                                        <td className="font-bold">{new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                        }).format(detailPayroll.data[0].bonuses.reduce((prev, next) => prev + (next.value / 100 * detailPayroll.data[0].salary), 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div>
                            <h3 className="py-2 text-lg font-bold text-center bg-gray-200 border-b">Deduction</h3>
                            <table className="w-full text-sm text-center">
                                <thead className="bg-blue-300">
                                    <tr>
                                        <th className="py-3 text-center">Item</th>
                                        <th className="py-3 text-center">Percentage</th>
                                        <th className="py-3 text-center">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailPayroll.data[0].deductions.map(({ name, value }, idx) => (
                                        <tr key={idx} className="bg-yellow-100">
                                            <td className="py-1">{name}</td>
                                            <td>{value}</td>
                                            <td>{new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(value / 100 * detailPayroll.data[0].salary)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100">
                                        <td className="py-2 font-bold" colSpan={2}>Total</td>
                                        <td className="font-bold text-pink-600">{new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                        }).format(detailPayroll.data[0].deductions.reduce((prev, next) => prev + (next.value / 100 * detailPayroll.data[0].salary), 0))}</td>
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
