// client/src/components/dashboard/patient-table.tsx

import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination";
import { FileText, Eye } from "lucide-react";
import type { Patient } from "../../../shared/schema";

interface PatientTableProps {
  patients: Patient[];
  getPatientStatus: (patient: Patient) => string;
  getPatientStatusColor: (patient: Patient) => string;
  getAssistantName?: (assistantId: string) => string;
  isDoctorView?: boolean;
}

const ROWS_PER_PAGE = 10;

export function PatientTable({
  patients,
  getPatientStatus,
  getPatientStatusColor,
  getAssistantName,
  isDoctorView = false,
}: PatientTableProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = patient.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || getPatientStatus(patient) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter, getPatientStatus]);

  const totalPages = Math.ceil(filteredPatients.length / ROWS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending Review">Pending Review</SelectItem>
            <SelectItem value="Report Ready">Report Ready</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            {isDoctorView && <TableHead>Submitted By</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPatients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell>{patient.fullName}</TableCell>
              {isDoctorView && (
                <TableCell>
                  {getAssistantName?.(patient.submittedByAssistantId!) || "N/A"}
                </TableCell>
              )}
              <TableCell>
                <Badge className={getPatientStatusColor(patient)}>
                  {getPatientStatus(patient)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(patient.createdAt || "").toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setLocation(
                      isDoctorView
                        ? `/doctor/${patient._id}`
                        : `/patient/${patient._id}`
                    )
                  }
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
