import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
  InputAdornment,
  Divider,
  Container,
  Paper,
  ListSubheader,
  Chip,
  AppBar,
  Toolbar,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  Person,
  Security,
  AccountBalanceWallet,
  CheckCircle,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { fetchJSON } from '../utils/api'; // add API helper

const COUNTRY_OPTIONS = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];
const COUNTRY_DIAL_CODES = {
  AF: '+93', AL: '+355', DZ: '+213', AD: '+376', AO: '+244', AG: '+1-268', AR: '+54', AM: '+374', AU: '+61', AT: '+43', AZ: '+994', BS: '+1-242', BH: '+973', BD: '+880', BB: '+1-246', BY: '+375', BE: '+32', BZ: '+501', BJ: '+229', BT: '+975', BO: '+591', BA: '+387', BW: '+267', BR: '+55', BN: '+673', BG: '+359', BF: '+226', BI: '+257', CV: '+238', KH: '+855', CM: '+237', CA: '+1', CF: '+236', TD: '+235', CL: '+56', CN: '+86', CO: '+57', KM: '+269', CG: '+242', CD: '+243', CR: '+506', CI: '+225', HR: '+385', CU: '+53', CY: '+357', CZ: '+420', DK: '+45', DJ: '+253', DM: '+1-767', DO: '+1-809', EC: '+593', EG: '+20', SV: '+503', GQ: '+240', ER: '+291', EE: '+372', SZ: '+268', ET: '+251', FJ: '+679', FI: '+358', FR: '+33', GA: '+241', GM: '+220', GE: '+995', DE: '+49', GH: '+233', GR: '+30', GD: '+1-473', GT: '+502', GN: '+224', GW: '+245', GY: '+592', HT: '+509', HN: '+504', HU: '+36', IS: '+354', IN: '+91', ID: '+62', IR: '+98', IQ: '+964', IE: '+353', IL: '+972', IT: '+39', JM: '+1-876', JP: '+81', JO: '+962', KZ: '+7', KE: '+254', KI: '+686', KW: '+965', KG: '+996', LA: '+856', LV: '+371', LB: '+961', LS: '+266', LR: '+231', LY: '+218', LI: '+423', LT: '+370', LU: '+352', MG: '+261', MW: '+265', MY: '+60', MV: '+960', ML: '+223', MT: '+356', MH: '+692', MR: '+222', MU: '+230', MX: '+52', MD: '+373', MC: '+377', MN: '+976', ME: '+382', MA: '+212', MZ: '+258', MM: '+95', NA: '+264', NR: '+674', NP: '+977', NL: '+31', NZ: '+64', NI: '+505', NE: '+227', NG: '+234', MK: '+389', NO: '+47', OM: '+968', PK: '+92', PW: '+680', PS: '+970', PA: '+507', PG: '+675', PY: '+595', PE: '+51', PH: '+63', PL: '+48', PT: '+351', QA: '+974', RO: '+40', RU: '+7', RW: '+250', KN: '+1-869', LC: '+1-758', VC: '+1-784', WS: '+685', SM: '+378', ST: '+239', SA: '+966', SN: '+221', RS: '+381', SC: '+248', SL: '+232', SG: '+65', SK: '+421', SI: '+386', SB: '+677', SO: '+252', ZA: '+27', KR: '+82', ES: '+34', LK: '+94', SD: '+249', SR: '+597', SE: '+46', CH: '+41', SY: '+963', TW: '+886', TJ: '+992', TZ: '+255', TH: '+66', TL: '+670', TG: '+228', TO: '+676', TT: '+1-868', TN: '+216', TR: '+90', TM: '+993', TV: '+688', UG: '+256', UA: '+380', AE: '+971', GB: '+44', US: '+1', UY: '+598', UZ: '+998', VU: '+678', VA: '+379', VE: '+58', VN: '+84', YE: '+967', ZM: '+260', ZW: '+263'
};

const COUNTRY_OPTIONS_SORTED = [...COUNTRY_OPTIONS].sort((a, b) => a.name.localeCompare(b.name));

const getDialRegion = (dial) => {
  const normalized = String(dial).replace(/[^\d+]/g, '');
  if (normalized.startsWith('+1')) return 'North America & Caribbean';
  if (normalized.startsWith('+2')) return 'Africa';
  if (normalized.startsWith('+3') || normalized.startsWith('+4')) return 'Europe';
  if (normalized.startsWith('+5')) return 'South & Central America';
  if (normalized.startsWith('+6')) return 'Oceania & SE Asia';
  if (normalized.startsWith('+7')) return 'Russia & Central Asia';
  if (normalized.startsWith('+8')) return 'East & North Asia';
  if (normalized.startsWith('+9')) return 'West & South Asia & Middle East';
  return 'Other';
};

const DIAL_REGION_ORDER = [
  'North America & Caribbean',
  'South & Central America',
  'Europe',
  'Africa',
  'East & North Asia',
  'West & South Asia & Middle East',
  'Oceania & SE Asia',
  'Russia & Central Asia',
  'Other'
];

const DIAL_GROUPS = DIAL_REGION_ORDER.reduce((acc, label) => ({ ...acc, [label]: [] }), {});
COUNTRY_OPTIONS.forEach((c) => {
  const dial = COUNTRY_DIAL_CODES[c.code];
  if (!dial) return;
  const label = getDialRegion(dial);
  DIAL_GROUPS[label].push({ code: c.code, name: c.name, dial });
});
Object.keys(DIAL_GROUPS).forEach((label) => {
  DIAL_GROUPS[label].sort((a, b) => a.name.localeCompare(b.name));
});

const steps = ['Personal Information', 'Wallet Setup'];

// Component: Register
function Register() {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [devEmailCode, setDevEmailCode] = useState('');
  const [emailCodeInput, setEmailCodeInput] = useState('');
  const [devPhoneCode, setDevPhoneCode] = useState('');
  const [phoneCodeInput, setPhoneCodeInput] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const toggleRegistrationForm = () => {
    setShowRegistrationForm(!showRegistrationForm);
  };


  // KYC-related states removed (aadhaar/pan/otp)
  // Form data state

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: 'IN',
    phoneCountryCode: '+91',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeTerms: false,

    // Wallet Information
    walletType: '',
    walletAddress: '',
    walletImage: null,
    
    // Verification
    emailVerified: false,
    phoneVerified: false,
    kycStatus: 'not_started'
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'walletAddress' ? { walletType: detectWalletType(value) } : {})
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // handleFileUpload removed (unused)

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
    }));
  };

  const handlePhoneDialChange = (event) => {
    const dial = event.target.value;
    setFormData((prev) => ({ ...prev, phoneCountryCode: dial }));
  };

  const handleWalletImage = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, walletImage: file }));
  };
  
  // Auto-detect wallet type from address
  const detectWalletType = (address) => {
    const a = (address || '').trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(a)) return 'evm'; // Ethereum/BSC-compatible
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(a)) return 'bitcoin';
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) return 'solana';
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) return 'tron';
    if (/^bnb1[0-9a-z]{38}$/.test(a)) return 'bnb';
    return '';
  };
  
  const detectionLabel = (type) => {
    switch (type) {
      case 'evm':
        return 'EVM-compatible (MetaMask / Trust / Coinbase)';
      case 'bitcoin':
        return 'Bitcoin';
      case 'solana':
        return 'Solana';
      case 'tron':
        return 'TRON';
      case 'bnb':
        return 'BNB Chain';
      default:
        return 'Unknown type';
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!formData.phoneCountryCode) {
          newErrors.phone = 'Dial code is required';
        }
        if (!formData.country) newErrors.country = 'Country is required';

        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms and conditions';
        break;
      case 1: // Wallet Setup
        // Enforce recognized wallet address for progression
        if (!formData.walletAddress) {
          newErrors.walletAddress = 'Wallet address is required';
        } else if (!formData.walletType) {
          newErrors.walletAddress = 'Unrecognized wallet address format';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;

    // When finishing Wallet Setup (step 1), register user server-side
    if (activeStep === 1) {
      setLoading(true);
      try {
        const usernameGuess = (formData.email || '').split('@')[0] || `${formData.firstName}${formData.lastName}` || `user${Date.now()}`;
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const payload = {
          username: usernameGuess,
          email: formData.email,
          password: formData.password,
          fullName,
          walletAddress: formData.walletAddress,
          referralCode: formData.referralCode || undefined,
          country: formData.country,
          phone: `${formData.phone}`,
          phoneCountryCode: formData.phoneCountryCode,
          // emailCountryCode removed
        };
        const response = await fetchJSON('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Store dev email verification code if provided by server
        if (response?.devEmailCode || response?.emailVerificationCode) {
          setDevEmailCode(response.devEmailCode || response.emailVerificationCode);
        }

        // Move to Account Verification step
        setActiveStep(2);
        setErrors({});
      } catch (err) {
        const msg = typeof err?.message === 'string' ? err.message : 'Registration failed';
        setErrors({ submit: msg });
      } finally {
        setLoading(false);
      }
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const registerAndSendEmailOtp = async () => {
    if (!validateStep(0)) return;
    setLoading(true);
    try {
      const usernameGuess = (formData.email || '').split('@')[0] || `${formData.firstName}${formData.lastName}` || `user${Date.now()}`;
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        username: usernameGuess,
        email: formData.email,
        password: formData.password,
        fullName,
        country: formData.country,
        phone: `${formData.phone}`,
        phoneCountryCode: formData.phoneCountryCode,
        walletAddress: formData.walletAddress || undefined,
        referralCode: formData.referralCode || undefined,
      };
      console.log('📤 Sending registration with payload:', payload);
      const response = await fetchJSON('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Registration response:', response);
      if (response?.devVerificationCode) {
        setDevEmailCode(response.devVerificationCode);
      }
      setIsRegistered(true);
      setShowEmailDialog(true);
      setErrors({});
    } catch (err) {
      console.error('❌ Registration error:', err);
      const msg = typeof err?.message === 'string' ? err.message : 'Registration failed';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const payload = { email: formData.email, code: emailCodeInput };
      console.log('📧 Verifying email with payload:', payload);
      const resp = await fetchJSON('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Email verification response:', resp);
      if (resp?.success) {
        setFormData((prev) => ({ ...prev, emailVerified: true }));
        setErrors({});
      } else {
        const msg = resp?.message || 'Verification failed';
        setErrors({ verify: msg });
      }
    } catch (err) {
      console.error('❌ Email verification error:', err);
      const msg = typeof err?.message === 'string' ? err.message : 'Network error verifying email';
      setErrors({ verify: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!isRegistered) {
      try {
        await registerAndSendEmailOtp();
      } catch (err) {
        setErrors({ phoneOtp: 'Please register first before sending phone OTP' });
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        phone: formData.phone,
        phoneCountryCode: formData.phoneCountryCode
      };
      console.log('📱 Sending phone OTP with payload:', payload);
      const resp = await fetchJSON('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Phone OTP response:', resp);
      if (resp?.success) {
        if (resp?.devVerificationCode) {
          setDevPhoneCode(resp.devVerificationCode);
          console.log('📱 Dev code received:', resp.devVerificationCode);
        }
        setShowPhoneDialog(true);
      } else {
        const msg = resp?.message || 'Failed to send phone OTP';
        setErrors({ phoneOtp: msg });
      }
    } catch (err) {
      console.error('❌ Phone OTP error:', err);
      const msg = typeof err?.message === 'string' ? err.message : 'Network error sending phone OTP';
      setErrors({ phoneOtp: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      const payload = { email: formData.email, code: phoneCodeInput };
      console.log('📱 Verifying phone with payload:', payload);
      const resp = await fetchJSON('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Phone verification response:', resp);
      if (resp?.success) {
        setFormData((prev) => ({ ...prev, phoneVerified: true }));
        setErrors({});
      } else {
        const msg = resp?.message || 'Phone verification failed';
        setErrors({ phoneVerify: msg });
      }
    } catch (err) {
      console.error('❌ Phone verification error:', err);
      const msg = typeof err?.message === 'string' ? err.message : 'Network error verifying phone';
      setErrors({ phoneVerify: msg });
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInformation = () => (
    <Grid container spacing={3}>
      {/* Show general errors */}
      {(errors.submit || errors.emailSend || errors.emailVerify || errors.phoneSend || errors.phoneOtp || errors.phoneVerify) && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setErrors({})}>
            {errors.submit || errors.emailSend || errors.emailVerify || errors.phoneSend || errors.phoneOtp || errors.phoneVerify}
          </Alert>
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!errors.email}
          helperText={errors.email}
        />
      </Grid>
      <Grid item xs={12}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          gap={2} 
          mt={1}
        >
          <Button
            variant="outlined"
            onClick={registerAndSendEmailOtp}
            fullWidth={{ xs: true, sm: false }[window.innerWidth < 600 ? 'xs' : 'sm']}
            disabled={
              loading ||
              !formData.email ||
              !formData.password ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.country ||
              !formData.phone ||
              !formData.phoneCountryCode
            }
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Send Email OTP
          </Button>
          <TextField
            label="Email OTP"
            value={emailCodeInput}
            onChange={(e) => setEmailCodeInput(e.target.value)}
            sx={{ maxWidth: { xs: '100%', sm: 200 }, width: '100%' }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleVerifyEmail}
            disabled={loading || !emailCodeInput || !isRegistered}
            fullWidth={{ xs: true, sm: false }[window.innerWidth < 600 ? 'xs' : 'sm']}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Verify Email
          </Button>
        </Box>
        {devEmailCode && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Dev email OTP: {devEmailCode}
          </Alert>
        )}
        {errors.emailSend && (
          <Typography color="error" variant="caption" display="block">{errors.emailSend}</Typography>
        )}
        {errors.emailVerify && (
          <Typography color="error" variant="caption" display="block">{errors.emailVerify}</Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          error={!!errors.phone}
          helperText={errors.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ minWidth: 80 }}>
                <FormControl size="small" variant="standard">
                  <Select
                    value={formData.phoneCountryCode || '+91'}
                    onChange={handlePhoneDialChange}
                    displayEmpty
                  >
                    <MenuItem value="+91">+91 (India)</MenuItem>
                  </Select>
                </FormControl>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          gap={2} 
          mt={1}
        >
          <Button
            variant="outlined"
            onClick={handleSendPhoneOtp}
            disabled={loading || !formData.phone || !formData.phoneCountryCode}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Send Phone OTP
          </Button>
          <TextField
            label="Phone OTP"
            value={phoneCodeInput}
            onChange={(e) => setPhoneCodeInput(e.target.value)}
            sx={{ maxWidth: { xs: '100%', sm: 200 }, width: '100%' }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleVerifyPhone}
            disabled={loading || !phoneCodeInput}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Verify Phone
          </Button>
        </Box>
        {errors.phoneOtp && (
          <Typography color="error" variant="caption" display="block">{errors.phoneOtp}</Typography>
        )}
        {errors.phoneSend && (
          <Typography color="error" variant="caption" display="block">{errors.phoneSend}</Typography>
        )}
        {errors.phoneVerify && (
          <Typography color="error" variant="caption" display="block">{errors.phoneVerify}</Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.country}>
          <InputLabel id="country-label">Country</InputLabel>
          <Select
            labelId="country-label"
            label="Country"
            value={formData.country}
            onChange={handleCountryChange}
          >
            {COUNTRY_OPTIONS_SORTED.map((c) => (
              <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
            ))}
          </Select>
          {errors.country && (
            <Typography color="error" variant="caption">{errors.country}</Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={!!errors.password}
          helperText={errors.password}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            />
          }
          label="I agree to the terms and conditions"
        />
        {errors.agreeTerms && (
          <Typography color="error" variant="caption" display="block">
            {errors.agreeTerms}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        {formData.emailVerified && formData.phoneVerified ? (
          <Alert severity="success">Both email and phone verified.</Alert>
        ) : (
          <Alert severity="warning">
            Verification pending: {!formData.emailVerified ? 'Email' : ''}{!formData.emailVerified && !formData.phoneVerified ? ' & ' : ''}{!formData.phoneVerified ? 'Phone' : ''}
          </Alert>
        )}
      </Grid>
    </Grid>
  );

  const renderWalletSetup = () => (
    <Grid container spacing={3}>
      {/* Wallet Address with detected type chip */}
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Wallet Address"
          value={formData.walletAddress}
          onChange={handleInputChange('walletAddress')}
          error={!!errors.walletAddress}
          helperText={errors.walletAddress}
        />
      </Grid>
      <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          label={detectionLabel(formData.walletType || '')}
          color={formData.walletType ? 'primary' : 'default'}
          variant="outlined"
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
          Upload Wallet Screenshot
          <input type="file" hidden accept="image/*" onChange={handleWalletImage} />
        </Button>
        {formData.walletImage && (
          <Typography variant="caption" sx={{ ml: 2 }}>
            Selected: {formData.walletImage.name}
          </Typography>
        )}
      </Grid>
    </Grid>
  );

  const renderVerification = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verify Your Email
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Enter the verification code sent to {formData.email}. If you're in development mode, you may see the code below.
      </Typography>
      {devEmailCode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dev Email Code: {devEmailCode}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email Verification Code"
            value={emailCodeInput}
            onChange={(e) => setEmailCodeInput(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyEmail}
            disabled={loading}
          >
            Verify Email
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderWalletSetup();
      case 2:
        return renderVerification();
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      {/* Top Menu Bar */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Crypto MLM Platform
          </Typography>
          <Tooltip title="Menu Options">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Menu for enabling/disabling elements */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.main', pointerEvents: 'none' }}>
          Display Options
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            toggleRegistrationForm();
            handleMenuClose();
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        >
          <Checkbox 
            checked={showRegistrationForm} 
            size="small" 
            sx={{ mr: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
          <Typography variant="body2">Registration Form</Typography>
        </MenuItem>
      </Menu>

      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
        {!showRegistrationForm ? (
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h5" color="textSecondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
                Registration form is disabled
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Click the menu (⋮) to enable it
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' } }}
            >
              Create Account
            </Typography>
        
        <Stepper 
          activeStep={activeStep} 
          sx={{ pt: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4, md: 5 } }}
          orientation={{ xs: 'vertical', sm: 'horizontal' }[window.innerWidth < 600 ? 'xs' : 'sm']}
          alternativeLabel={window.innerWidth >= 600}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', mt: 3, gap: { xs: 1, sm: 0 } }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: { xs: 0, sm: 1 }, order: { xs: 2, sm: 1 } }}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 1 && (!formData.walletAddress || !formData.walletType))}
                fullWidth={{ xs: true, sm: false }[window.innerWidth < 600 ? 'xs' : 'sm']}
                sx={{ order: { xs: 1, sm: 2 } }}
              >
                {activeStep === steps.length - 1 ? 'Complete Registration' : 'Next'}
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Email Verification Dialog */}
      {showEmailDialog && (
        <Dialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)}>
          <DialogTitle>Verify Email</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Enter 6-digit code"
              type="text"
              fullWidth
              variant="outlined"
              value={emailCodeInput}
              onChange={(e) => setEmailCodeInput(e.target.value)}
              placeholder="000000"
              sx={{ mt: 2 }}
            />
            {devEmailCode && (
              <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                Dev Code: {devEmailCode}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEmailDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleVerifyEmail} 
              variant="contained"
              disabled={loading || emailCodeInput.length !== 6}
            >
              Verify
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Phone OTP Dialog */}
      {showPhoneDialog && (
        <Dialog open={showPhoneDialog} onClose={() => setShowPhoneDialog(false)}>
          <DialogTitle>Verify Phone</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Enter 6-digit OTP"
              type="text"
              fullWidth
              variant="outlined"
              value={phoneCodeInput}
              onChange={(e) => setPhoneCodeInput(e.target.value)}
              placeholder="000000"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPhoneDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleVerifyPhone} 
              variant="contained"
              disabled={loading || phoneCodeInput.length !== 6}
            >
              Verify
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default Register;