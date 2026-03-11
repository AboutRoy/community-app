"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // This connects the pipe

export default function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      // 1. Handle File Upload (The Receipt)
      const file = formData.get('receipt') as File;
      let receiptPath = "";
      
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs') // Your Bucket Name
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        receiptPath = fileName;
      }

      // 2. Handle Database Insert (The Owner Data)
      const { error: dbError } = await supabase
        .from('owners') // Your Table Name
        .insert([{
          first_name: formData.get('firstName'),
          last_name: formData.get('lastName'),
          father_name: formData.get('fatherName'),
          contact_primary: formData.get('phone1'),
          contact_secondary: formData.get('phone2'),
          email_id: formData.get('email'),
          survey_number: formData.get('survey'),
          plot_number: formData.get('plot'),
          area_guntha: formData.get('area'),
          last_payment_mode: formData.get('mode'),
          receipt_url: receiptPath, // Saving the file reference
        }]);

      if (dbError) throw dbError;
      
      setMessage("✅ Success! Registration submitted for approval.");
      e.target.reset();
    } catch (error: any) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Owner Registration</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="First Name" className="p-2 border rounded" required />
            <input name="lastName" placeholder="Last Name" className="p-2 border rounded" required />
          </div>
          <input name="fatherName" placeholder="Father's Name" className="p-2 border rounded w-full" required />
          <input name="phone1" placeholder="Contact 1" className="p-2 border rounded w-full" required />
          <input name="email" type="email" placeholder="Email" className="p-2 border rounded w-full" required />
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <input name="plot" placeholder="Plot #" className="p-2 border rounded" required />
            <input name="area" type="number" placeholder="Area (Guntha)" className="p-2 border rounded" required />
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <label className="block text-sm font-bold mb-2">Last Payment Proof</label>
            <select name="mode" className="w-full p-2 mb-2 border rounded">
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
            <input name="receipt" type="file" className="text-sm" required />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Submit Registration"}
          </button>
          
          {message && <p className="mt-4 text-center font-semibold">{message}</p>}
        </form>
      </div>
    </div>
  );
}