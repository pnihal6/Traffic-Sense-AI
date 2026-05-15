import React from 'react';
import Card from '../components/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../App';

type ModelEntry = {
  name: string;
  file?: string;
  params: number;
  flops: number;
  precision: number;
  recall: number;
  mAP50: number;
  mAP50_95: number;
  boxLoss: number;
  clsLoss: number;
  dflLoss: number;
  isNew?: boolean;
  isBest?: boolean;
};

const toPct = (x?: number) =>
  typeof x === 'number' ? `${(x * 100).toFixed(1)}%` : '—';

const ModelsPage: React.FC = () => {
  const { theme } = useTheme();

  /** 
   * COMPLETE MODEL DATA - 9 Models
   * Newer models: YOLOv8-LI, YOLOv8-MSN, YOLO-SE, YOLO-DFA
   **/
  const models: ModelEntry[] = [
    // ========== BASELINE MODELS ==========
    {
      name: 'YOLOv8-N (Baseline)',
      file: 'yolov8.pt',
      params: 3.01,
      flops: 4.10,
      precision: 0.8689,
      recall: 0.8315,
      mAP50: 0.9090,
      mAP50_95: 0.7680,
      boxLoss: 0.7102,
      clsLoss: 0.3961,
      dflLoss: 0.9712,
    },
    {
      name: 'YOLOv8-FDIDH + DWR',
      file: 'yolov8-fidih-dwr.pt',
      params: 13.57,
      flops: 12.5,
      precision: 0.9056,
      recall: 0.8319,
      mAP50: 0.9003,
      mAP50_95: 0.7603,
      boxLoss: 0.7387,
      clsLoss: 0.3992,
      dflLoss: 0.9294,
    },
    {
      name: 'YOLOv8-FDIDH + DySample',
      file: 'yolov8-fidih-dysample.pt',
      params: 21.19,
      flops: 15.0,
      precision: 0.8676,
      recall: 0.8310,
      mAP50: 0.8980,
      mAP50_95: 0.7207,
      boxLoss: 0.8996,
      clsLoss: 0.5169,
      dflLoss: 0.9969,
    },
    {
      name: 'YOLOv8-FDD',
      file: 'yolov8-fdd.pt',
      params: 16.56,
      flops: 40.02,
      precision: 0.8433,
      recall: 0.7919,
      mAP50: 0.8717,
      mAP50_95: 0.6797,
      boxLoss: 1.0281,
      clsLoss: 0.6629,
      dflLoss: 1.0904,
    },
    {
      name: 'YOLOv8-FDE',
      file: 'yolofde.pt',
      params: 2.69,
      flops: 3.50,
      precision: 0.9077,
      recall: 0.8806,
      mAP50: 0.9242,
      mAP50_95: 0.8159,
      boxLoss: 0.6083,
      clsLoss: 0.3239,
      dflLoss: 0.8771,
    },
    // ========== NEWER MODELS (4 additions) ==========
    {
      name: 'YOLOv8-LI',
      file: null,
      params: 4.19,
      flops: 8.20,
      precision: 0.9069,
      recall: 0.8037,
      mAP50: 0.9050,
      mAP50_95: 0.7270,
      boxLoss: 0.7995,
      clsLoss: 0.4733,
      dflLoss: 1.1069,
      isNew: true,
    },
    {
      name: 'YOLOv8-MSN',
      file: 'msn.pt',
      params: 5.01,
      flops: 13.40,
      precision: 0.8974,
      recall: 0.7826,
      mAP50: 0.8580,
      mAP50_95: 0.6390,
      boxLoss: 0.7796,
      clsLoss: 0.5891,
      dflLoss: 1.2700,
      isNew: true,
    },
    {
      name: 'YOLO-SE',
      file: null,
      params: 3.16,
      flops: 8.40,
      precision: 0.8983,
      recall: 0.8650,
      mAP50: 0.9160,
      mAP50_95: 0.7590,
      boxLoss: 0.7369,
      clsLoss: 0.4360,
      dflLoss: 0.9022,
      isNew: true,
    },
    {
      name: 'YOLO-BiFPN',
      file: 'bifpn.pt',
      params: 3.10,
      flops: 8.30,
      precision: 0.9229,
      recall: 0.8299,
      mAP50: 0.9140,
      mAP50_95: 0.7620,
      boxLoss: 0.7385,
      clsLoss: 0.4470,
      dflLoss: 0.9363,
    },
    {
      name: 'YOLOv8-MHSA',
      file: 'mhsa.pt',
      params: 3.39,
      flops: 9.10,
      precision: 0.8963,
      recall: 0.8015,
      mAP50: 0.8920,
      mAP50_95: 0.7390,
      boxLoss: 0.7720,
      clsLoss: 0.4797,
      dflLoss: 1.0172,
    },
    // ========== STATE-OF-THE-ART: YOLO-DFA ==========
    {
      name: '🔥 YOLO-DFA (Proposed)',
      file: 'dfa.pt',
      params: 2.57,
      flops: 6.50,
      precision: 0.9242,
      recall: 0.8898,
      mAP50: 0.9332,
      mAP50_95: 0.8302,
      boxLoss: 0.6166,
      clsLoss: 0.3834,
      dflLoss: 0.8923,
      isNew: true,
      isBest: true,
    },
  ];

  // Sort: YOLO-DFA first, then by name
  const sortedModels = [...models].sort((a, b) => {
    if (a.isBest) return -1;
    if (b.isBest) return 1;
    return a.name.localeCompare(b.name);
  });

  /** 
   * ========== YOLOv8-FDE MODULES (KEEP ALL OLD CARDS) ==========
   **/
  const fdeModules = [
    {
      title: 'C3K2 Block',
      summary:
        'Compact residual unit using smaller kernels for lower compute without compromising receptive field.',
      diagram: '/images/c3k2_diagram.png',
      detail: `C3K2 modifies the classic C3/C2f structure with lighter convolution layers and smaller kernels, enabling efficient multi-scale representation while cutting parameters.`,
    },
    {
      title: 'FDIDH (Feature Dynamic Interaction Detection Head)',
      summary:
        'Enhances classification–regression interaction with dynamic feature fusion and deformable convolutions.',
      diagram: '/images/fdidh_diagram.png',
      detail: `FDIDH explicitly links classification and regression:
• Residual 3×3 convs for pre-interaction features.
• Regression branch with Deformable Convolutions for adaptive boundary sampling.
• Classification branch uses dynamic filters for boundary-aware focus.
• Layer Attention preserves independence while improving shared understanding.`,
    },
    {
      title: 'DySample (Dynamic Sampling Upsampling)',
      summary:
        'Adaptive upsampling that learns positional biases for fine-grained object reconstruction.',
      diagram: '/images/dysample_diagram.png',
      detail: `DySample learns offset fields and positional biases:
• Replaces nearest-neighbor upsampling with learned dynamic sampling.
• Grouped channel processing for efficiency.
• Improves detail recovery for small or occluded objects.`,
    },
    {
      title: 'DWR (Dilation-Wise Residual)',
      summary:
        'Parallel dilated conv branches expand receptive field efficiently at neck layers (P4/P5).',
      diagram: '/images/dwr_diagram.png',
      detail: `DWR introduces multi-dilation branches:
• Local capture with 3×3 Conv→BN→ReLU.
• Semantic expansion with depthwise dilations (2×, 4×, 8×).
• Receptive field boost without parameter inflation.`,
    },
    {
      title: 'Post-SPPF Attention',
      summary:
        'Light attention post-SPPF for motion and shape amplification under varied lighting.',
      diagram: '/images/post_sppf_attention.png',
      detail: `Analyzes pooled SPPF outputs to reweight channels/spatial regions for clearer motion & shape cues under complex lighting.`,
    },
  ];

  /** 
   * ========== YOLO-DFA NEW MODULES (5 new cards) ==========
   **/
  const dfaNewModules = [
    {
      title: 'R-ELAN (Residual Efficient Layer Aggregation)',
      summary:
        'Multi-branch feature aggregation with residual connections and learnable scaling for enhanced gradient flow and stable optimization.',
      diagram: '/images/relan.png',
      detail: `R-ELAN extends CSP concepts with residual multi-branch aggregation:
• Parallel convolutional paths with different receptive fields (Equation 1: F_k = Conv_k(X))
• Learnable scaling parameters (α) for stable optimization (Equation 4: F_out = X + α·F_fused)
• Enables deeper attention mechanisms without optimization issues
• Located in backbone for enhanced feature extraction
• Aggregates outputs through concatenation and fusion convolution`,
    },
    {
      title: 'BiFPN with Learnable Weighted Fusion',
      summary:
        'Bidirectional feature pyramid with adaptive weighted fusion for balanced multi-scale integration.',
      diagram: '/images/bifpn.png',
      detail: `BiFPN introduces learnable weights for each fusion path:
• Swish-activated normalized weights for multi-input fusion (Equation 6: normalized weights sum to one)
• Top-down and bottom-up pathways with adaptive scaling (Equations 8 & 9)
• Enables network to emphasize informative scales while suppressing less relevant ones
• Critical for small and occluded vehicle detection
• Replaces traditional FPN/PANet with weighted feature fusion`,
    },
    {
      title: 'C2PSA (Partial Spatial Attention)',
      summary:
        'Spatial attention on partitioned feature branches for selective refinement with minimal overhead.',
      diagram: '/images/c2psa_diagram.png',
      detail: `C2PSA splits features into two branches:
• One branch undergoes spatial attention refinement (Equation 11: A = σ(Conv₂(ReLU(Conv₁(X₁)))))
• Other branch preserves information via identity
• Lightweight attention map via two convolutional layers
• Selective spatial focus without full self-attention cost
• Applied in neck for localization refinement under dense occlusion`,
    },
    {
      title: 'SE (Squeeze-and-Excitation) Modules',
      summary:
        'Channel-wise attention via global context pooling and bottleneck MLP for feature recalibration.',
      diagram: '/images/se.png',
      detail: `SE operates in two stages:
• Squeeze: Global average pooling aggregates spatial information (Equation 14: z_c = 1/(H×W) Σ X(i,j,c))
• Excitation: Bottleneck MLP captures channel dependencies (Equation 15: s = σ(W₂·ReLU(W₁z)))
• Recalibrates features by emphasizing informative channels (Equation 16: X̂(i,j,c) = s_c·X(i,j,c))
• Strategically placed after key fusion points in Neck/Head
• Reduction ratio r=16 for parameter efficiency`,
    },
    {
      title: 'Area Attention',
      summary:
        'Region-based attention modeling long-range spatial context efficiently.',
      detail: `Area Attention operates on spatial regions instead of pixels:
• Reduces effective sequence length from HW to HW/r² where r is region size
• Models long-range dependencies with lower computation
• Essential for understanding holistic scene context in complex traffic
• Applied in neck for regional contextual modeling
• Maintains global context while being computationally efficient`,
    },
  ];

  const themeColors = {
    light: {
      text: '#374151',
      grid: '#e5e7eb',
      tooltipBg: 'rgba(255,255,255,0.9)',
      tooltipBorder: '#d1d5db',
    },
    dark: {
      text: '#d1d5db',
      grid: '#374151',
      tooltipBg: 'rgba(31,41,55,0.9)',
      tooltipBorder: '#4b5563',
    },
  };
  const currentThemeColors =
    theme === 'dark' ? themeColors.dark : themeColors.light;

  const perfChartData = sortedModels.map((m) => ({
    name: m.name.replace('🔥 ', ''),
    mAP50: m.mAP50,
    mAP50_95: m.mAP50_95,
    precision: m.precision,
    recall: m.recall,
  }));

  // Find models for conclusion
  const dfaModel = models.find((m) => m.name.includes('DFA'));
  const fdeModel = models.find((m) => m.name === 'YOLOv8-FDE');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">
        YOLO Models Comparison & Analysis
      </h1>

      {/* PDF DOWNLOAD - Both Papers */}
      <div className="flex justify-center gap-4 flex-wrap">
        <a
          href="/papers/YOLO_DFA.pdf"
          download
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-amber-700 transition"
        >
          📄 Download YOLO-DFA Paper (Latest)
        </a>
        <a
          href="/papers/YOLO_FDE.pdf"
          download
          className="inline-flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-700 transition"
        >
          📄 Download YOLOv8-FDE Paper
        </a>
      </div>

      {/* 🏆 YOLO-DFA HIGHLIGHT CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-400 dark:border-amber-600 shadow-xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-4xl">🏆</span>
            <h2 className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              NEW STATE-OF-THE-ART: YOLO-DFA
            </h2>
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              Latest Release
            </span>
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              Most Accurate
            </span>
            <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
              Most Efficient
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {dfaModel?.params}M
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Params</p>
              <p className="text-xs text-green-500">↓4.6% vs FDE</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {dfaModel?.flops}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">GFLOPs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {toPct(dfaModel?.mAP50)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">mAP@50</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {toPct(dfaModel?.mAP50_95)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">mAP@50-95</p>
              <p className="text-xs text-green-500">↑1.43% vs FDE</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
            YOLO-DFA achieves superior accuracy with only <strong>2.57M parameters</strong> and{' '}
            <strong>6.50 GFLOPs</strong>, establishing a new benchmark for resource-optimized
            high-accuracy vehicle detection on edge devices.
          </p>
        </div>
      </motion.div>

      {/* PERFORMANCE CHART */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Performance Metrics Comparison (9 Models)
        </h2>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={perfChartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={currentThemeColors.grid}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: currentThemeColors.text, fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: currentThemeColors.text }} domain={[0.5, 1]} />
            <Tooltip
              formatter={(value: any, name: string) =>
                [`${(Number(value) * 100).toFixed(2)}%`, name]
              }
              contentStyle={{
                backgroundColor: currentThemeColors.tooltipBg,
                borderColor: currentThemeColors.tooltipBorder,
                color: currentThemeColors.text,
              }}
              cursor={{ fill: 'rgba(128,128,128,0.08)' }}
            />
            <Legend />
            <Bar dataKey="mAP50" name="mAP@50" fill="#3b82f6" />
            <Bar dataKey="mAP50_95" name="mAP@50-95" fill="#60a5fa" />
            <Bar dataKey="precision" name="Precision" fill="#82ca9d" />
            <Bar dataKey="recall" name="Recall" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-center text-sm text-gray-500 mt-2 italic">
          YOLO-DFA achieves highest mAP@50 (93.3%) and mAP@50-95 (83.0%) across all models
        </p>
      </Card>

      {/* TABLE I - Complete 9 Models */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Table I — Complete Model Performance Comparison (UA-DETRAC)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="uppercase text-xs bg-slate-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2 text-center">File</th>
                <th className="px-4 py-2 text-center">Params (M)</th>
                <th className="px-4 py-2 text-center">GFLOPs</th>
                <th className="px-4 py-2 text-center">Precision</th>
                <th className="px-4 py-2 text-center">Recall</th>
                <th className="px-4 py-2 text-center">mAP@50</th>
                <th className="px-4 py-2 text-center">mAP@50-95</th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map((m, i) => (
                <tr
                  key={m.name}
                  className={`border-b ${
                    i % 2 === 0
                      ? 'bg-white dark:bg-dark-card'
                      : 'bg-slate-100 dark:bg-dark-border'
                  } ${
                    m.isBest
                      ? 'font-bold bg-amber-50 dark:bg-amber-900/30 border-l-4 border-l-amber-500'
                      : m.isNew && !m.isBest
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    {m.isBest && <span className="text-amber-500 mr-1">🏆</span>}
                    {m.name}
                    {m.isNew && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-mono text-xs">
                    {m.file || '—'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m.params}
                    {m.isBest && m.params === 2.57 && (
                      <span className="text-green-500 text-xs ml-1">↓4.6%</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">{m.flops}</td>
                  <td className="px-4 py-2 text-center">{toPct(m.precision)}</td>
                  <td className="px-4 py-2 text-center">{toPct(m.recall)}</td>
                  <td className="px-4 py-2 text-center font-medium">
                    {toPct(m.mAP50)}
                    {m.isBest && (
                      <span className="text-green-500 text-xs ml-1">↑0.97%</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-medium">
                    {toPct(m.mAP50_95)}
                    {m.isBest && (
                      <span className="text-green-500 text-xs ml-1">↑1.43%</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          🆕 Newer models: YOLOv8-LI, YOLOv8-MSN, YOLO-SE, YOLO-DFA
        </p>
      </Card>

      {/* TABLE II - Loss Comparison */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Table II — Model Loss Comparison at Convergence
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="uppercase text-xs bg-slate-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2 text-center">Box Loss</th>
                <th className="px-4 py-2 text-center">Cls Loss</th>
                <th className="px-4 py-2 text-center">DFL Loss</th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map((m, i) => (
                <tr
                  key={`${m.name}-loss`}
                  className={`border-b ${
                    i % 2 === 0
                      ? 'bg-white dark:bg-dark-card'
                      : 'bg-slate-100 dark:bg-dark-border'
                  } ${
                    m.isBest
                      ? 'font-bold bg-amber-50 dark:bg-amber-900/30'
                      : m.isNew && !m.isBest
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    {m.isBest && <span className="text-amber-500 mr-1">🏆</span>}
                    {m.name}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m.boxLoss.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m.clsLoss.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m.dflLoss.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========== SECTION 1: YOLOv8-FDE MODULES (ALL OLD CARDS) ========== */}
      <Card>
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
            📦 YOLOv8-FDE Core Modules
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Foundational components from the previous FDE architecture
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fdeModules.map((mod, idx) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl overflow-hidden border dark:border-gray-700 shadow-lg bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-primary-600 dark:text-green-400">
                {mod.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                {mod.summary}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-line leading-relaxed">
                {mod.detail}
              </p>
              <div className="mt-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner">
                <img
                  src={mod.diagram}
                  alt={`${mod.title} diagram`}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      '/images/placeholder_module.png')
                  }
                  className="w-full object-contain rounded-xl transition-transform duration-500 hover:scale-[1.05]"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 italic">
                  Figure: {mod.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ========== SECTION 2: YOLO-DFA NEW MODULES (5 NEW CARDS) ========== */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🚀</span>
            <h2 className="text-3xl font-bold text-center text-amber-600 dark:text-amber-400">
              YOLO-DFA New Innovations
            </h2>
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              5 New Modules
            </span>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Dynamic Feature Aggregation enhancements for state-of-the-art performance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dfaNewModules.map((mod, idx) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl overflow-hidden border-2 border-amber-200 dark:border-amber-700 shadow-xl bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5 flex flex-col relative"
            >
              <div className="absolute top-3 right-3">
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  NEW in DFA
                </span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400 pr-20">
                {mod.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-snug font-medium">
                {mod.summary}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line leading-relaxed">
                {mod.detail}
              </p>
              <div className="mt-4 rounded-xl overflow-hidden bg-white/50 dark:bg-gray-800/50 shadow-inner">
                <img
                  src={mod.diagram}
                  alt={`${mod.title} diagram`}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      '/images/placeholder_module.png')
                  }
                  className="w-full object-contain rounded-xl transition-transform duration-500 hover:scale-[1.05]"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 italic">
                  Figure: {mod.title} Architecture
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* YOLO-DFA Architecture Overview */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">
          YOLO-DFA Complete Architecture
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center">
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-inner">
              <img
                src="/images/dfa.png"
                alt="YOLO-DFA Architecture"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    '/images/placeholder_arch.png')
                }
                className="rounded-lg shadow-lg w-full object-contain transition-transform duration-500 hover:scale-[1.03]"
              />
              <p className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400 italic">
                Figure: YOLO-DFA architecture with BiFPN, C2PSA, SE, R-ELAN, Area Attention, and FDIDH head.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3"
          >
            <p>
              The <strong className="text-amber-600 dark:text-amber-400">YOLO-DFA (Dynamic Feature Aggregation)</strong>{' '}
              architecture introduces <strong>5 key innovations</strong> over YOLOv8-FDE:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>R-ELAN</strong> - Residual multi-branch aggregation for enhanced gradient flow</li>
              <li><strong>BiFPN</strong> - Learnable weighted fusion for balanced multi-scale integration</li>
              <li><strong>C2PSA</strong> - Partial spatial attention for localization refinement</li>
              <li><strong>SE</strong> - Squeeze-and-Excitation for adaptive channel recalibration</li>
              <li><strong>Area Attention</strong> - Region-based modeling for long-range spatial context</li>
            </ul>
            <p>
              These components work synergistically, enabling dynamic cross-scale interaction and contextual reasoning
              while maintaining extreme parameter efficiency (only <strong>2.57M parameters</strong>).
            </p>
            <p>
              The <strong>FDIDH</strong> detection head is retained from YOLOv8-FDE, providing explicit feature
              interaction between classification and regression branches.
            </p>
          </motion.div>
        </div>
      </Card>

      {/* CONCLUSION - Updated for YOLO-DFA */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">Conclusion</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The proposed <strong className="text-amber-600 dark:text-amber-400">YOLO-DFA (Dynamic Feature Aggregation)</strong>{' '}
          achieves a new state-of-the-art on the UA-DETRAC benchmark:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">2.57M</p>
            <p className="text-xs">Parameters</p>
            <p className="text-green-600 text-xs">↓4.6% vs FDE</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">6.50</p>
            <p className="text-xs">GFLOPs</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{toPct(dfaModel?.mAP50)}</p>
            <p className="text-xs">mAP@50</p>
            <p className="text-green-600 text-xs">↑0.97% vs FDE</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{toPct(dfaModel?.mAP50_95)}</p>
            <p className="text-xs">mAP@50-95</p>
            <p className="text-green-600 text-xs">↑1.43% vs FDE</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The combination of <strong>R-ELAN, BiFPN, C2PSA, SE, and Area Attention</strong> enables accurate detection
          in dense, complex traffic scenes while maintaining high efficiency, making YOLO-DFA particularly suitable
          for deployment on resource-constrained edge devices in intelligent transportation and autonomous driving applications.
        </p>
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            📄 References: YOLOv8-FDE Paper (2024) | YOLO-DFA Paper (2025) - IEEE Access
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ModelsPage;