import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/library';
import { API_URL } from '@/config/api';
import { isAuthenticated, isGestor, isAdmin } from '@/auth-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Camera,
  CameraOff,
} from 'lucide-react';

interface ValidationResult {
  success: boolean;
  message: string;
  order?: {
    id: string;
    eventName: string;
    eventDate: string;
    userName: string;
    userEmail: string;
    items: Array<{
      lotName: string;
      quantity: number;
      price: number;
    }>;
    totalQuantity: number;
    totalPrice: number;
  };
  error?: string;
}

interface ValidatedTicket {
  id: string;
  orderId: string;
  eventName: string;
  holderName: string;
  holderEmail: string;
  items: string;
  totalQuantity: number;
  validatedAt: string;
  status: 'valid' | 'invalid' | 'already-used';
}

export default function ValidarIngressoPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [lastValidation, setLastValidation] = useState<ValidatedTicket | null>(
    null
  );
  const [validationHistory, setValidationHistory] = useState<ValidatedTicket[]>(
    []
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Verificar se é gestor ou admin
    if (!isGestor() && !isAdmin()) {
      navigate('/');
      return;
    }

    // Listar câmeras disponíveis
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const cameras = devices.filter(
            (device) => device.kind === 'videoinput'
          );
          setAvailableCameras(cameras);
          // Seleciona a primeira câmera traseira por padrão
          const rearCamera = cameras.find(
            (camera) =>
              camera.label.toLowerCase().includes('back') ||
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('traseira')
          );
          if (rearCamera) {
            setSelectedCameraId(rearCamera.deviceId);
          } else if (cameras.length > 0) {
            setSelectedCameraId(cameras[0].deviceId);
          }
        })
        .catch((err) => console.error('Erro ao listar câmeras:', err));
    }

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      console.log('Iniciando scanner...');
      setIsScanning(true);

      // Verificar se há suporte para câmera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          'Seu navegador não suporta acesso à câmera. Use um navegador moderno.'
        );
        setIsScanning(false);
        return;
      }

      const videoElement = videoRef.current;
      if (!videoElement) {
        console.error('Elemento de vídeo não encontrado');
        setIsScanning(false);
        return;
      }

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
        console.log('BrowserMultiFormatReader criado');
      }

      setIsCameraActive(true);
      console.log('Tentando iniciar câmera...');

      // Configurar ID da câmera - usa a selecionada ou padrão
      const deviceId = selectedCameraId || null;
      console.log('Usando câmera:', deviceId);

      // Inicia o scanner com a câmera específica
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoElement,
        (result, error) => {
          if (result) {
            console.log('QR Code detectado:', result.getText());
            const qrData = result.getText();
            handleQRCodeScanned(qrData);
          }

          // Não loga NotFoundException - são erros normais durante a leitura contínua
          if (error && !error.message?.includes('No MultiFormat Readers')) {
            console.error('Erro durante leitura:', error);
          }
        }
      );

      console.log('Scanner iniciado com sucesso');
    } catch (error: unknown) {
      console.error('Erro ao iniciar câmera:', error);

      let errorMessage = 'Erro ao acessar a câmera.';

      if (error instanceof Error) {
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        ) {
          errorMessage =
            'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.';
        } else if (
          error.name === 'NotFoundError' ||
          error.name === 'DevicesNotFoundError'
        ) {
          errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
        } else if (
          error.name === 'NotReadableError' ||
          error.name === 'TrackStartError'
        ) {
          errorMessage = 'Câmera está sendo usada por outro aplicativo.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Câmera não suporta as configurações solicitadas.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      alert(errorMessage);
      setIsScanning(false);
      setIsCameraActive(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    setIsCameraActive(false);
  };

  const handleQRCodeScanned = async (qrData: string) => {
    stopScanning();

    try {
      const data = JSON.parse(qrData);
      await validateTicket(data.orderId);
    } catch {
      alert('QR Code inválido. Formato não reconhecido.');
    }
  };

  const handleManualValidation = async () => {
    if (!manualCode.trim()) {
      alert('Digite o código do pedido');
      return;
    }
    // Remove o # se o usuário incluiu
    const cleanCode = manualCode.trim().replace(/^#/, '');
    await validateTicket(cleanCode);
    setManualCode('');
  };

  const validateTicket = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data: ValidationResult = await response.json();

      if (!response.ok) {
        const newValidation: ValidatedTicket = {
          id: Date.now().toString(),
          orderId: data.order?.id || orderId,
          eventName: data.order?.eventName || 'Desconhecido',
          holderName: data.order?.userName || 'Desconhecido',
          holderEmail: data.order?.userEmail || '',
          items: data.order?.items
            ? data.order.items
                .map((i) => `${i.lotName} (${i.quantity}x)`)
                .join(', ')
            : '',
          totalQuantity: data.order?.totalQuantity || 0,
          validatedAt: new Date().toISOString(),
          status: data.error?.includes('já foi validado')
            ? 'already-used'
            : 'invalid',
        };

        setLastValidation(newValidation);
        setValidationHistory((prev) => [newValidation, ...prev]);
        return;
      }

      if (data.success && data.order) {
        const newValidation: ValidatedTicket = {
          id: Date.now().toString(),
          orderId: data.order.id,
          eventName: data.order.eventName,
          holderName: data.order.userName,
          holderEmail: data.order.userEmail,
          items: data.order.items
            .map((i) => `${i.lotName} (${i.quantity}x)`)
            .join(', '),
          totalQuantity: data.order.totalQuantity,
          validatedAt: new Date().toISOString(),
          status: 'valid',
        };

        setLastValidation(newValidation);
        setValidationHistory((prev) => [newValidation, ...prev]);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao validar ingresso: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ValidatedTicket['status']) => {
    switch (status) {
      case 'valid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Válido
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Inválido
          </Badge>
        );
      case 'already-used':
        return (
          <Badge
            variant="secondary"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Clock className="w-3 h-3 mr-1" />
            Já Utilizado
          </Badge>
        );
    }
  };

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: validationHistory.length,
    valid: validationHistory.filter((t) => t.status === 'valid').length,
    invalid: validationHistory.filter((t) => t.status === 'invalid').length,
    alreadyUsed: validationHistory.filter((t) => t.status === 'already-used')
      .length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Validação de Ingressos
          </h1>
          <p className="text-muted-foreground">
            Escaneie o QR Code ou insira o código manualmente para validar
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Válidos</p>
                <p className="text-3xl font-bold text-green-500">
                  {stats.valid}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Inválidos</p>
                <p className="text-3xl font-bold text-destructive">
                  {stats.invalid}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Já Usados</p>
                <p className="text-3xl font-bold text-orange-500">
                  {stats.alreadyUsed}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* QR Code Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scanner QR Code
                </CardTitle>
                <CardDescription>
                  Aponte a câmera para o QR Code do ingresso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scanner Preview */}
                <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    autoPlay
                    playsInline
                  />

                  {!isCameraActive && (
                    <div className="text-center p-8">
                      <Camera className="w-24 h-24 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Clique em "Iniciar Scanner" para ativar a câmera
                      </p>
                    </div>
                  )}

                  {/* Scanner overlay */}
                  {isCameraActive && (
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-lg pointer-events-none">
                      <div className="absolute inset-8 border-2 border-primary rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Seletor de Câmera */}
                {availableCameras.length > 1 && !isCameraActive && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Selecionar Câmera:
                    </label>
                    <select
                      value={selectedCameraId || ''}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {availableCameras.map((camera) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label ||
                            `Câmera ${camera.deviceId.substring(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isCameraActive ? (
                    <Button
                      onClick={startScanning}
                      className="flex-1"
                      disabled={loading || isScanning}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Scanner
                    </Button>
                  ) : (
                    <Button
                      onClick={stopScanning}
                      variant="destructive"
                      className="flex-1"
                      disabled={isScanning && !isCameraActive}
                    >
                      <CameraOff className="w-4 h-4 mr-2" />
                      Parar Scanner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Validação Manual
                </CardTitle>
                <CardDescription>
                  Insira o código do pedido manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ex: 318e4971 ou código completo..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleManualValidation()
                    }
                    disabled={loading}
                  />
                  <Button
                    onClick={handleManualValidation}
                    disabled={loading || !manualCode.trim()}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Last Validation */}
            {lastValidation ? (
              <Card
                className={
                  lastValidation.status === 'valid'
                    ? 'border-green-500'
                    : lastValidation.status === 'invalid'
                      ? 'border-destructive'
                      : 'border-orange-500'
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Última Validação</span>
                    {getStatusBadge(lastValidation.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lastValidation.status === 'valid' && (
                    <div className="flex items-center justify-center py-4">
                      <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </div>
                  )}
                  {lastValidation.status === 'invalid' && (
                    <div className="flex items-center justify-center py-4">
                      <XCircle className="w-20 h-20 text-destructive" />
                    </div>
                  )}
                  {lastValidation.status === 'already-used' && (
                    <div className="flex items-center justify-center py-4">
                      <Clock className="w-20 h-20 text-orange-500" />
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Evento</p>
                      <p className="font-medium">{lastValidation.eventName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Titular</p>
                      <p className="font-medium">{lastValidation.holderName}</p>
                    </div>
                  </div>
                  {lastValidation.items && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ingressos</p>
                      <p className="font-medium">{lastValidation.items}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Validado em</p>
                    <p className="font-medium">
                      {formatDateTime(lastValidation.validatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma validação realizada ainda
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Escaneie um QR Code ou insira um código manualmente
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Validation History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Validações</CardTitle>
                <CardDescription>Últimas validações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {validationHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma validação realizada ainda
                    </p>
                  ) : (
                    validationHistory.map((validation) => (
                      <div
                        key={validation.id}
                        className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {validation.eventName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {validation.holderName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(validation.validatedAt)}
                          </p>
                        </div>
                        {getStatusBadge(validation.status)}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
