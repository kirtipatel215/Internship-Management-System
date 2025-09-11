// lib/noc-generator.ts - Enhanced NOC Certificate Generator

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface NOCCertificateData {
  student: {
    name: string
    email: string
    id: string
    rollNumber?: string
    department?: string
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
  return `CHARUSAT/NOC/${year}/${month}${day}/${random}`
}

export const generateNOCHTML = (data: NOCCertificateData): string => {
  return `
    <div id="noc-certificate" style="
      width: 800px;
      min-height: 1100px;
      margin: 0 auto;
      padding: 60px;
      background: white;
      font-family: 'Times New Roman', serif;
      color: #333;
      line-height: 1.6;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    ">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e40af; padding-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 32px; margin: 0; font-weight: bold;">
          CHARUSAT UNIVERSITY
        </h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">
          Charotar University of Science and Technology
        </p>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">
          CHARUSAT Campus, Changa - 388421, Gujarat, India
        </p>
      </div>

      <!-- Certificate Title -->
      <div style="text-align: center; margin: 40px 0;">
        <h2 style="
          color: #dc2626; 
          font-size: 28px; 
          margin: 0; 
          text-decoration: underline;
          font-weight: bold;
        ">
          NO OBJECTION CERTIFICATE
        </h2>
        <p style="color: #666; font-size: 16px; margin-top: 10px;">
          Certificate No: ${data.approval.certificateNumber}
        </p>
      </div>

      <!-- Certificate Body -->
      <div style="margin: 40px 0; text-align: justify; font-size: 16px;">
        <p style="margin-bottom: 25px;">
          <strong>Date:</strong> ${new Date(data.approval.approvedDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
          })}
        </p>

        <p style="margin-bottom: 25px; font-size: 18px;">
          <strong>To Whom It May Concern,</strong>
        </p>

        <p style="margin-bottom: 25px;">
          This is to certify that <strong>${data.student.name}</strong> 
          (Roll Number: <strong>${data.student.rollNumber || 'N/A'}</strong>), 
          a student of <strong>${data.student.department || 'Computer Engineering'}</strong> 
          at Charusat University, has been granted permission to undertake an internship with:
        </p>

        <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #1e40af; margin: 25px 0;">
          <p style="margin: 5px 0;"><strong>Company:</strong> ${data.internship.company}</p>
          <p style="margin: 5px 0;"><strong>Position:</strong> ${data.internship.position}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.internship.duration}</p>
          <p style="margin: 5px 0;"><strong>Period:</strong> ${new Date(data.internship.startDate).toLocaleDateString('en-IN')} to ${new Date(data.internship.endDate).toLocaleDateString('en-IN')}</p>
        </div>

        <p style="margin-bottom: 25px;">
          The university has <strong>no objection</strong> to the student undertaking this internship 
          as part of their academic curriculum. This internship has been approved by both the 
          Training & Placement Office and the Academic Department.
        </p>

        <p style="margin-bottom: 25px;">
          We request the concerned organization to provide necessary cooperation and guidance 
          to the student during the internship period.
        </p>

        <p style="margin-bottom: 40px;">
          This certificate is issued for official purposes and is valid for the mentioned period only.
        </p>
      </div>

      <!-- Signatures -->
      <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="text-align: center; width: 200px;">
          <div style="border-bottom: 1px solid #333; height: 60px; margin-bottom: 10px;"></div>
          <p style="margin: 0; font-weight: bold;">Training & Placement Officer</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Charusat University</p>
        </div>

        <div style="text-align: center; width: 200px;">
          <div style="border-bottom: 1px solid #333; height: 60px; margin-bottom: 10px;"></div>
          <p style="margin: 0; font-weight: bold;">Academic Supervisor</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${data.student.department || 'Department'}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>This is a computer-generated certificate. For verification, contact: placement@charusat.edu.in</p>
        <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  `
}

export const generateAndDownloadNOCPDF = async (data: NOCCertificateData): Promise<{
  success: boolean
  pdfBlob?: Blob
  fileName?: string
  error?: string
}> => {
  try {
    // Create a temporary container for the HTML
    const container = document.createElement('div')
    container.innerHTML = generateNOCHTML(data)
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    document.body.appendChild(container)

    const element = container.querySelector('#noc-certificate') as HTMLElement
    if (!element) {
      throw new Error('NOC certificate element not found')
    }

    // Generate canvas
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

    // Calculate dimensions
    const imgWidth = 210 // A4 width
    const pageHeight = 297 // A4 height
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

    // Clean up
    document.body.removeChild(container)

    // Convert to blob
    const pdfBlob = pdf.output('blob')
    const fileName = `NOC_${data.student.name.replace(/\s+/g, '_')}_${data.internship.company.replace(/\s+/g, '_')}_${data.approval.certificateNumber?.replace(/\//g, '_')}.pdf`

    return {
      success: true,
      pdfBlob,
      fileName
    }

  } catch (error) {
    console.error('Error generating NOC PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    }
  }
}
