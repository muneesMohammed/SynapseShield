using Azure;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure.Messaging.EventHubs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Twin.Function
{
    public class EventHubToDigitalTwin
    {
        private readonly ILogger<EventHubToDigitalTwin> _logger;
        private static readonly string? adtInstanceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");
        private static readonly HttpClient httpClient = new HttpClient();

        public EventHubToDigitalTwin(ILogger<EventHubToDigitalTwin> logger)
        {
            _logger = logger;
        }

        [Function(nameof(EventHubToDigitalTwin))]
        public async Task Run(
            [EventHubTrigger("eventhub-name", Connection = "EVENTHUB_CONNECTION_STRING", ConsumerGroup = "$Default")] EventData[] events)
        {
            if (adtInstanceUrl == null)
            {
                _logger.LogError("Application setting 'ADT_SERVICE_URL' not set");
                return;
            }

            var credential = new DefaultAzureCredential();
            var client = new DigitalTwinsClient(new Uri(adtInstanceUrl), credential);
            _logger.LogInformation("Connected to Azure Digital Twins instance.");

            foreach (var eventData in events)
            {
                try
                {
                    string messageBody = Encoding.UTF8.GetString(eventData.EventBody.ToArray());
                    _logger.LogInformation($"Event received: {messageBody}");

                    JObject deviceMessage = JObject.Parse(messageBody);

                    // Extract data from the message
                    string deviceId = deviceMessage["deviceId"]?.Value<string>() ?? "UnknownDevice";


                    var deviceid = deviceMessage["deviceId"];
                    var ipAddress = deviceMessage["ipAddress"];
                    var os = deviceMessage["os"];
                    var status = deviceMessage["status"];
                    var patchLevel = deviceMessage["patchLevel"];
                    var vulnerabilityScore = deviceMessage["vulnerabilityScore"];
                    var protocol = deviceMessage["protocol"];
                    var port = deviceMessage["port"];
                    var trafficVolume = deviceMessage["trafficVolume"];
                    var latency = deviceMessage["latency"];
                    var suspiciousFlag = deviceMessage["suspiciousFlag"];
                    var attackType = deviceMessage["attackType"];
                    var attackProbability = deviceMessage["attackProbability"];
                    var attackPath = deviceMessage["attackPath"];
                    var detectedBy = deviceMessage["detectedBy"];
                    var time = deviceMessage["time"];


                    _logger.LogInformation($"Device {deviceId}: ipAddress={ipAddress}, os={os} status ={status}");
                    // Prepare update payload with correct types according to DTDL
                    var updateTwinData = new JsonPatchDocument();

                    // DeviceProperties (all strings)
                    updateTwinData.AppendReplace("/DeviceProperties/deviceId", deviceid?.Value<string>());
                    updateTwinData.AppendReplace("/DeviceProperties/ipAddress", ipAddress?.Value<string>());
                    updateTwinData.AppendReplace("/DeviceProperties/os", os?.Value<string>());
                    updateTwinData.AppendReplace("/DeviceProperties/status", status?.Value<string>());
                    updateTwinData.AppendReplace("/DeviceProperties/patchLevel", patchLevel?.Value<string>());
                    updateTwinData.AppendReplace("/DeviceProperties/vulnerabilityScore", vulnerabilityScore?.Value<string>());

                    // TrafficProperties
                    updateTwinData.AppendReplace("/TrafficProperties/protocol", protocol?.Value<string>());
                    updateTwinData.AppendReplace("/TrafficProperties/port", port?.Value<string>());
                    updateTwinData.AppendReplace("/TrafficProperties/trafficVolume", trafficVolume?.Value<int>() ?? 0);
                    updateTwinData.AppendReplace("/TrafficProperties/latency", latency?.Value<int>() ?? 0);
                    updateTwinData.AppendReplace("/TrafficProperties/suspiciousFlag", suspiciousFlag?.Value<int>() ?? 0);

                    //// AttackSimulationProperties
                    updateTwinData.AppendReplace("/AttackSimulationProperties/attackType", attackType?.ToString());
                    updateTwinData.AppendReplace("/AttackSimulationProperties/attackProbability", attackProbability?.Value<int>() ?? 0);
                    updateTwinData.AppendReplace("/AttackSimulationProperties/attackPath", attackPath?.Value<int>() ?? 0);
                    updateTwinData.AppendReplace("/AttackSimulationProperties/detectedBy", detectedBy?.Value<int>() ?? 0);

                    // Update Digital Twin
                    //await client.UpdateDigitalTwinAsync(deviceId, updateTwinData);
                    //_logger.LogInformation($"Digital Twin updated successfully for device {deviceId}.");
                    await client.UpdateDigitalTwinAsync(deviceId.ToString(), updateTwinData);
                    _logger.LogInformation($"Digital Twin updated successfully for device {deviceId}");

                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error processing event: {ex.Message}");
                }
            }
        }
    }
}
