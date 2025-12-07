// test-booking.js
const testBooking = async () => {
  const bookingData = {
    appointmentType: 'IN_PERSON',
    serviceType: 'GENERAL_CONSULTATION',
    appointmentDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    patientName: 'Test Patient',
    patientEmail: 'test@example.com',
    patientPhone: '1234567890',
    patientAge: 30,
    patientGender: 'MALE',
    symptoms: 'Test symptoms for appointment',
    previousTreatment: 'None',
    agreeToTerms: true
  };

  console.log('Testing booking with data:', bookingData);

  try {
    const response = await fetch('http://localhost:3000/api/appointments/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testBooking();