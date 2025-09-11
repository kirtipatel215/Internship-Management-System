// lib/noc-generator.ts
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface NOCCertificateData {
  student: {
    name: string
    email: string
    id: string
    course?: string
    year?: string
    rollNumber?: string
  }
  internship: {
    company: string
    position: string
    duration: string
    startDate: string
    endDate: string
    description?: string
  }
  approval: {
    approvedBy: string
    approvedDate: string
    tpOfficer?: string
    teacher?: string
    certificateNumber?: string
  }
}

export const generateNOCCertificateNumber = (): string => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `NOC/${year}/${month}/${day}/${random}`
}

export const downloadNOCAsPDF = async (
  elementId: string = 'noc-certificate',
  filename?: string
): Promise<void> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('NOC certificate element not found')
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Calculate dimensions to fit A4
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download the PDF
    const defaultFilename = `NOC_Certificate_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(filename || defaultFilename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF certificate')
  }
}

export const printNOCCertificate = (): void => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Unable to open print window')
  }

  const certificateElement = document.getElementById('noc-certificate')
  if (!certificateElement) {
    throw new Error('NOC certificate element not found')
  }

  // Create print-friendly HTML
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NOC Certificate - Print</title>
        <style>
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          .certificate-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
          }
          
          /* Copy existing styles */
          ${getComputedStylesAsString(certificateElement)}
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${certificateElement.outerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(printHTML)
  printWindow.document.close()
}

const getComputedStylesAsString = (element: Element): string => {
  const computedStyles = window.getComputedStyle(element)
  let cssText = ''
  
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i]
    const value = computedStyles.getPropertyValue(property)
    cssText += `${property}: ${value}; `
  }
  
  return `
    .certificate-container * {
      ${cssText}
    }
  `
}

export const validateNOCData = (data: NOCCertificateData): string[] => {
  const errors: string[] = []

  // Student validation
  if (!data.student.name?.trim()) {
    errors.push('Student name is required')
  }
  if (!data.student.email?.trim()) {
    errors.push('Student email is required')
  }
  if (!data.student.id?.trim()) {
    errors.push('Student ID is required')
  }

  // Internship validation
  if (!data.internship.company?.trim()) {
    errors.push('Company name is required')
  }
  if (!data.internship.position?.trim()) {
    errors.push('Position is required')
  }
  if (!data.internship.startDate) {
    errors.push('Start date is required')
  }
  if (!data.internship.endDate) {
    errors.push('End date is required')
  }

  // Date validation
  if (data.internship.startDate && data.internship.endDate) {
    const startDate = new Date(data.internship.startDate)
    const endDate = new Date(data.internship.endDate)
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date')
    }
  }

  // Approval validation
  if (!data.approval.approvedDate) {
    errors.push('Approval date is required')
  }
  if (!data.approval.approvedBy?.trim()) {
    errors.push('Approving authority is required')
  }

  return errors
}

export const formatNOCDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

export const calculateInternshipDuration = (startDate: string, endDate: string): string => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    }
    
    const diffMonths = Math.ceil(diffDays / 30)
    if (diffMonths === 1) {
      return '1 month'
    }
    
    if (diffMonths < 12) {
      return `${diffMonths} months`
    }
    
    const years = Math.floor(diffMonths / 12)
    const remainingMonths = diffMonths % 12
    
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    }
    
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  } catch (error) {
    return 'Duration not specified'
  }
}