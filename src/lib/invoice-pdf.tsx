import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer"
import type { Customer, Invoice, InvoiceItem } from "@/lib/types"
import { BUSINESS } from "@/lib/business-details"

const formatGBP = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#0f172a", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  brand: { fontSize: 16, fontWeight: 700 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    fontSize: 9,
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginBottom: 6,
  },
  invoiceNumber: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  metaLabel: { color: "#94a3b8", fontSize: 9, textAlign: "right" },
  section: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  blockLabel: { color: "#94a3b8", fontSize: 9, marginBottom: 4, textTransform: "uppercase" },
  blockText: { fontSize: 10, marginBottom: 2 },
  table: { marginTop: 8, borderTopWidth: 2, borderTopColor: "#0f172a" },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e9f0", paddingVertical: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e9f0", paddingVertical: 8 },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1, textAlign: "right" },
  colAmount: { flex: 1, textAlign: "right" },
  headerCell: { color: "#94a3b8", fontSize: 8, fontWeight: 700, textTransform: "uppercase" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalLabel: { fontSize: 12, fontWeight: 700, marginRight: 16 },
  totalValue: { fontSize: 12, fontWeight: 700 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8" },
})

export function InvoicePdfDocument({
  invoice,
  customer,
  items,
}: {
  invoice: Invoice
  customer: Customer
  items: InvoiceItem[]
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Chay Shields</Text>
            <Text style={{ color: "#94a3b8", marginTop: 2 }}>hireme.link</Text>
          </View>
          <View>
            <Text style={styles.badge}>PAID</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.metaLabel}>Issued {formatDate(invoice.issue_date)}</Text>
            {invoice.paid_date && <Text style={styles.metaLabel}>Paid {formatDate(invoice.paid_date)}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View>
            <Text style={styles.blockLabel}>Billed to</Text>
            <Text style={styles.blockText}>{customer.name}</Text>
            {customer.company && <Text style={styles.blockText}>{customer.company}</Text>}
            <Text style={styles.blockText}>{customer.email}</Text>
          </View>
          <View>
            <Text style={styles.blockLabel}>From</Text>
            <Text style={styles.blockText}>Chay Shields, Digital Specialist</Text>
            <Text style={styles.blockText}>{BUSINESS.contactEmail}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatGBP(item.unit_price)}</Text>
              <Text style={styles.colAmount}>{formatGBP(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total paid</Text>
          <Text style={styles.totalValue}>{formatGBP(invoice.total)}</Text>
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.blockLabel}>Notes</Text>
            <Text style={styles.blockText}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Billing System &middot; on behalf of Chay Shields &middot; hireme.link
        </Text>
      </Page>
    </Document>
  )
}

export async function renderInvoicePdf(invoice: Invoice, customer: Customer, items: InvoiceItem[]) {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} customer={customer} items={items} />)
}
