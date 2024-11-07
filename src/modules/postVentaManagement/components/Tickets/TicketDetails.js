// src/modules/postVentaManagement/components/Tickets/TicketDetails.js
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePostVentaManagement } from '../../context/postVentaManagementContext';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  FileDown,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    serviceTickets, 
    getSiteDetails, 
    service, 
    loading,
    systems 
  } = usePostVentaManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const ticket = serviceTickets.find(t => t.id === id);
  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle size={48} className="text-error mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ticket no encontrado</h2>
        <Button
          variant="outline"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>
    );
  }

  const siteDetails = getSiteDetails(ticket.siteId);
  const system = systems.find(s => s.id === ticket.systemId);

  const handleFileDownload = async (itemId, fileName) => {
    if (!itemId) return;

    try {
      const { url, token } = await service.getImageContent(
        service.siteId,
        service.driveId,
        itemId
      );

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error downloading file');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case 'Cerrada':
      case 'Finalizada':
        return 'text-success bg-success/10';
      case 'Trabajo iniciado':
      case 'Confirmado por tecnico':
        return 'text-info bg-info/10';
      case 'Técnico asignado':
        return 'text-warning bg-warning/10';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No establecida';
    return new Date(date).toLocaleString('es-CR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Information */}
        <Card 
          className="lg:col-span-2"
          title={
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">ST {ticket.stNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">{ticket.type}</p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.state)}`}>
                {ticket.state}
              </span>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Fechas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha Tentativa</p>
                  <p className="mt-1">{formatDate(ticket.tentativeDate)}</p>
                </div>
                {ticket.confirmationDate && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Confirmación</p>
                    <p className="mt-1">{formatDate(ticket.confirmationDate)}</p>
                  </div>
                )}
                {ticket.workStartDate && (
                  <div>
                    <p className="text-sm text-gray-500">Inicio de Trabajo</p>
                    <p className="mt-1">{formatDate(ticket.workStartDate)}</p>
                  </div>
                )}
                {ticket.workEndDate && (
                  <div>
                    <p className="text-sm text-gray-500">Fin de Trabajo</p>
                    <p className="mt-1">{formatDate(ticket.workEndDate)}</p>
                  </div>
                )}
                {ticket.closeDate && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Cierre</p>
                    <p className="mt-1">{formatDate(ticket.closeDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {ticket.technicians.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Técnicos Asignados</h3>
                <div className="space-y-3">
                  {ticket.technicians.map((tech, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User size={20} className="text-primary" />
                      </div>
                      <span>{tech.LookupValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Archivos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ticket.descriptionId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    startIcon={<FileText size={16} />}
                    onClick={() => handleFileDownload(ticket.descriptionId, `ST_${ticket.stNumber}_descripcion.pdf`)}
                  >
                    Descripción
                  </Button>
                )}
                {ticket.serviceTicketId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    startIcon={<Download size={16} />}
                    onClick={() => handleFileDownload(ticket.serviceTicketId, `ST_${ticket.stNumber}_boleta.pdf`)}
                  >
                    Boleta de Servicio
                  </Button>
                )}
                {ticket.reportId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    startIcon={<FileDown size={16} />}
                    onClick={() => handleFileDownload(ticket.reportId, `ST_${ticket.stNumber}_informe.pdf`)}
                  >
                    Informe
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Site Information */}
        <div className="space-y-6">
          <Card title="Información de Sitio">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{siteDetails?.company?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Edificio</p>
                <p className="font-medium">{siteDetails?.building?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sitio</p>
                <p className="font-medium">{siteDetails?.site?.name || 'N/A'}</p>
              </div>
              {system && (
                <div>
                  <p className="text-sm text-gray-500">Sistema</p>
                  <p className="font-medium">{system.name}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Información de Contacto">
            <div className="space-y-4">
              {siteDetails?.site?.contactName && (
                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre de contacto</p>
                    <p className="font-medium">{siteDetails.site.contactName}</p>
                  </div>
                </div>
              )}
              {siteDetails?.site?.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Correo electrónico</p>
                    <p className="font-medium">{siteDetails.site.contactEmail}</p>
                  </div>
                </div>
              )}
              {siteDetails?.site?.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{siteDetails.site.contactPhone}</p>
                  </div>
                </div>
              )}
              {siteDetails?.site?.location && (
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium">{siteDetails.site.location}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;