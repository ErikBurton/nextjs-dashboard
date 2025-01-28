'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// Omit `id` and `date` from the schema when creating an invoice
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Function to create a new invoice
export async function createInvoice(formData: FormData) {
  try {
    // Ensure all form data is parsed correctly, with null checks
    const customerId = formData.get('customerId');
    const amount = formData.get('amount');
    const status = formData.get('status');

    if (!customerId || !amount || !status) {
      throw new Error('Missing required form fields');
    }

    const { customerId: validCustomerId, amount: validAmount, status: validStatus } = CreateInvoice.parse({
      customerId,
      amount: parseFloat(amount.toString()),  // Ensuring the amount is a number
      status,
    });

    const amountInCents = validAmount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Inserting the new invoice into the database
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${validCustomerId}, ${amountInCents}, ${validStatus}, ${date})
    `;

    // Revalidate path and redirect
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    console.error('Error creating invoice:', error);
    // Optional: Throw a custom error or return an error message here
  }
}

// Schema for updating an invoice (same as create but omitting id and date)
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// Function to update an existing invoice
export async function updateInvoice(id: string, formData: FormData) {
  try {
    // Ensure all form data is parsed correctly, with null checks
    const customerId = formData.get('customerId');
    const amount = formData.get('amount');
    const status = formData.get('status');

    if (!customerId || !amount || !status) {
      throw new Error('Missing required form fields');
    }

    const { customerId: validCustomerId, amount: validAmount, status: validStatus } = UpdateInvoice.parse({
      customerId,
      amount: parseFloat(amount.toString()),  // Ensuring the amount is a number
      status,
    });

    const amountInCents = validAmount * 100;

    // Updating the existing invoice in the database
    await sql`
      UPDATE invoices
      SET customer_id = ${validCustomerId}, amount = ${amountInCents}, status = ${validStatus}
      WHERE id = ${id}
    `;

    // Revalidate path and redirect
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    console.error('Error updating invoice:', error);
    // Optional: Throw a custom error or return an error message here
  }
}

// Function to delete an invoice
export async function deleteInvoice(id: string) {
  try {
    // Delete the invoice by id
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    // Revalidate path
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Error deleting invoice:', error);
    // Optional: Throw a custom error or return an error message here
  }
}
