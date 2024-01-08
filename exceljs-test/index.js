const { Workbook } = require('exceljs')

// workbook工作簿 -> worksheet工作表 -> row -> cell
async function main() {
  const workhook = new Workbook()
  const workhook2 = await workhook.xlsx.readFile('./data.xlsx')

  workhook2.eachSheet((worksheet, id) => {
    console.log('excel:' + id)
    worksheet.eachRow((row, rowNumber) => {
      const rowData = []

      row.eachCell((cell, colNumber) => {
        rowData.push(cell.value)
      })

      console.log('行' + rowNumber, rowData)
    })
  })
}

async function createExcel() {
  const workhook = new Workbook()
  const worksheet = workhook.addWorksheet('表1')
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 20 },
    { header: '姓名', key: 'name', width: 30 },
    { header: '出生日期', key: 'birthday', width: 30 },
    { header: '手机号', key: 'phone', width: 50 },
  ]

  const data = [
    { id: 1, name: '光光', birthday: new Date('1994-07-07'), phone: '13255555555' },
    { id: 2, name: '东东', birthday: new Date('1994-04-14'), phone: '13222222222' },
    { id: 3, name: '小刚', birthday: new Date('1995-08-08'), phone: '13211111111' },
  ]
  worksheet.addRows(data);

  workhook.xlsx.writeFile('./明细数据.xlsx')
}

// main()
createExcel()
