import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const exportMonthToPDF = async (month: string, year: string, entries: any[], stats: any) => {
  const doc = new jsPDF()
  
  // Заголовок
  doc.setFontSize(20)
  doc.text(`Отчет за ${month} ${year}`, 14, 20)
  
  // Статистика
  doc.setFontSize(12)
  doc.text(`Общий оборот: ${stats.totalRevenue?.toLocaleString() || 0} $`, 14, 35)
  doc.text(`Записей: ${stats.totalEntries || 0}`, 14, 42)
  doc.text(`Выплачено ЗП: ${stats.totalSalaries?.toLocaleString() || 0} $`, 14, 49)
  
  // Таблица
  const tableData = entries.map((e: any) => [
    e.date,
    e.symbols,
    e.amount ? `${e.amount.toLocaleString()} $` : '-',
    e.salary ? `${e.salary.toLocaleString()} $` : '-'
  ])
  
  // @ts-ignore
  doc.autoTable({
    startY: 60,
    head: [['Дата', 'Клиент', 'Оборот', 'ЗП']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
  })
  
  // Сохранить
  doc.save(`Отчет_${month}_${year}.pdf`)
}

export const exportYearToPDF = async (year: string, monthsData: any[], stats: any) => {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text(`Годовой отчет ${year}`, 14, 20)
  
  doc.setFontSize(12)
  doc.text(`Общий оборот: ${stats.totalRevenue?.toLocaleString() || 0} $`, 14, 35)
  doc.text(`Всего месяцев: ${monthsData.length}`, 14, 42)
  
  const tableData = monthsData.map((m: any) => [
    m.name,
    `${m.revenue.toLocaleString()} $`,
    `${m.count} записей`,
    `${m.earnings.toLocaleString()} $`
  ])
  
  // @ts-ignore
  doc.autoTable({
    startY: 55,
    head: [['Месяц', 'Оборот', 'Записи', 'Заработок']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
  })
  
  doc.save(`Годовой_отчет_${year}.pdf`)
}
