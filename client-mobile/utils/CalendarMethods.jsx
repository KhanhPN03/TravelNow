export const parseDate = (dateStr) => {
    // Chuyển đổi tour.date theo định dạng YYYY-MM-DD thành đối tượng Date
    if (dateStr?.includes('-')) {     
      return `${year}-${month}-${day}`; // YYYY-MM-DD
    }
  
    // Chuyển đổi startDate/endDate theo định dạng MM/DD/YY thành đối tượng Date
    if (dateStr?.includes('/')) {
      let [month, day, year] = dateStr.split('/');   
      month = month.padStart(2, '0');   
      return `${year}-${month}-${day}`; // Tạo Date dạng YYYY-MM-DD
    }
  
    return null; // Trả về null nếu không phải định dạng mong muốn
  }