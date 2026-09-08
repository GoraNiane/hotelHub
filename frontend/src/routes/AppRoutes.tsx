import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute, RoleBasedRoute } from './ProtectedRoutes';

// Lazy loading or direct imports - we will define direct imports once pages are implemented.
// For now, we stub them with inline wrappers or actual page imports.
import { Home } from '../pages/public/Home';
import { Rooms } from '../pages/public/Rooms';
import { RoomDetails } from '../pages/public/RoomDetails';
import { BookingWizard } from '../pages/public/BookingWizard';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

import { ClientDashboard } from '../pages/client/ClientDashboard';
import { ClientReservations } from '../pages/client/ClientReservations';
import { ClientProfile } from '../pages/client/ClientProfile';

import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { ReceptionistReservations } from '../pages/receptionist/ReceptionistReservations';
import { ReceptionistCalendar } from '../pages/receptionist/ReceptionistCalendar';
import { ReceptionistClients } from '../pages/receptionist/ReceptionistClients';
import { ReceptionistRooms } from '../pages/receptionist/ReceptionistRooms';
import { ReceptionistCheckin } from '../pages/receptionist/ReceptionistCheckin';
import { ReceptionistCheckout } from '../pages/receptionist/ReceptionistCheckout';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminRooms } from '../pages/admin/AdminRooms';
import { AdminReservations } from '../pages/admin/AdminReservations';
import { AdminClients } from '../pages/admin/AdminClients';
import { AdminEmployees } from '../pages/admin/AdminEmployees';
import { AdminServices } from '../pages/admin/AdminServices';
import { AdminPromotions } from '../pages/admin/AdminPromotions';
import { AdminPayments } from '../pages/admin/AdminPayments';
import { AdminReviews } from '../pages/admin/AdminReviews';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:id" element={<RoomDetails />} />
        <Route path="booking" element={<BookingWizard />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Client Portal Routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['CLIENT']}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="reservations" element={<ClientReservations />} />
        <Route path="profile" element={<ClientProfile />} />
      </Route>

      {/* Receptionist Portal Routes */}
      <Route
        path="/reception"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="reservations" element={<ReceptionistReservations />} />
        <Route path="calendar" element={<ReceptionistCalendar />} />
        <Route path="clients" element={<ReceptionistClients />} />
        <Route path="rooms" element={<ReceptionistRooms />} />
        <Route path="checkin" element={<ReceptionistCheckin />} />
        <Route path="checkout" element={<ReceptionistCheckout />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>

      {/* Redirect all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
