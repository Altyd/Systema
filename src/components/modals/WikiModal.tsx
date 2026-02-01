import { X } from 'lucide-react';

interface WikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WikiModal = ({ isOpen, onClose }: WikiModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-system-bg border-2 border-system-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-system-bg border-b border-system-border p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Component Types Guide</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-system-hover rounded transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>
            <p className="text-gray-400 mb-8 leading-relaxed">
              SystemA supports six component types, each representing a different part of your system architecture. 
              Choose the type that best matches each component's role and responsibility.
            </p>

            <div className="space-y-8">
              {/* API */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔌</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">API</h3>
                    <p className="text-sm text-gray-400">Application Programming Interface</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  REST APIs, GraphQL endpoints, gRPC services, or any service that exposes an interface for other systems to call.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> HTTP endpoints, microservices, API gateways, serverless functions</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Rate limiting, timeout errors, service crashes, authentication failures</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Response times, rate limits, authentication, versioning, backward compatibility</span>
                  </div>
                </div>
              </section>

              {/* Database */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🗄️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Database</h3>
                    <p className="text-sm text-gray-400">Data Storage & Persistence</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  SQL databases (PostgreSQL, MySQL), NoSQL stores (MongoDB, DynamoDB), caches (Redis), search indexes (Elasticsearch).
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> Any persistent data storage, caching layers, search indexes</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Connection pool exhaustion, deadlocks, disk space, replication lag, query timeouts</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Backup strategy, replication, consistency model, connection limits, indexing</span>
                  </div>
                </div>
              </section>

              {/* Worker */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Worker</h3>
                    <p className="text-sm text-gray-400">Background Processing</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Background job processors, async task handlers, scheduled jobs, batch processors, event consumers.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> Async processing, scheduled tasks, data pipelines, email senders, image processors</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Job timeouts, memory leaks, task queue backlog, processing errors, zombie processes</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Retry logic, idempotency, monitoring queue depth, resource limits, graceful shutdown</span>
                  </div>
                </div>
              </section>

              {/* Queue */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Queue</h3>
                    <p className="text-sm text-gray-400">Message Queues & Event Streams</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Message queues (RabbitMQ, SQS), event streams (Kafka, Kinesis), pub/sub systems, service buses.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> Decoupling services, event-driven architecture, async communication, buffering</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Message loss, duplicate delivery, queue overflow, consumer lag, poisoned messages</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Delivery guarantees, ordering, retention policy, dead letter queues, consumer scaling</span>
                  </div>
                </div>
              </section>

              {/* External Service */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">External Service</h3>
                    <p className="text-sm text-gray-400">Third-Party Dependencies</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Third-party APIs, SaaS platforms, payment processors, authentication providers, cloud services you don't control.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> Stripe, Auth0, Twilio, AWS services, Google APIs, any external dependency</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Service outages, rate limiting, API changes, network issues, authentication expiry</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Circuit breakers, fallbacks, caching, graceful degradation, vendor lock-in risk</span>
                  </div>
                </div>
              </section>

              {/* Human Process */}
              <section className="border border-system-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Human Process</h3>
                    <p className="text-sm text-gray-400">Manual Workflows & Operations</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Manual approval workflows, human-in-the-loop processes, on-call engineers, customer support, manual data entry.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">When to use:</span>
                    <span className="text-white"> Manual approvals, content moderation, ops interventions, escalations, runbooks</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Example failures:</span>
                    <span className="text-white"> Human error, delayed response, unavailability, miscommunication, burnout</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold">Key considerations:</span>
                    <span className="text-white"> Response time SLAs, on-call rotation, documentation, training, automation opportunities</span>
                  </div>
                </div>
              </section>
            </div>

            {/* General Tips */}
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">💡 General Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Be specific:</strong> Label each component with its actual name (e.g., "User Service API" not just "API")</li>
                <li>• <strong>Show dependencies:</strong> Connect components to show data flow and dependencies clearly</li>
                <li>• <strong>Document failures:</strong> The best architectures anticipate what can go wrong</li>
                <li>• <strong>Plan recovery:</strong> Every failure mode should have a documented recovery strategy</li>
                <li>• <strong>Use criticality:</strong> Mark components as High/Medium/Low criticality (affects color coding)</li>
                <li>• <strong>Iterate:</strong> Start simple and add detail as you learn more about failure modes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
