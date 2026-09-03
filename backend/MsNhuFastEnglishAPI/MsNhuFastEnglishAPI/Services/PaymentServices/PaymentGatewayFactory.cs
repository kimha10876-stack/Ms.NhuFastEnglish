using System;
using System.Collections.Generic;
using System.Linq;

namespace MsNhuFastEnglishAPI.Services.PaymentServices;

public class PaymentGatewayFactory(IEnumerable<IPaymentGateway> gateways)
{
    public IPaymentGateway GetGateway(string gatewayName)
    {
        var gw = gateways.FirstOrDefault(g => g.GatewayName.Equals(gatewayName, StringComparison.OrdinalIgnoreCase));
        if (gw != null) return gw;

        // Fallback to PayOS as default
        var defaultGw = gateways.FirstOrDefault(g => g.GatewayName.Equals("PayOS", StringComparison.OrdinalIgnoreCase));
        return defaultGw ?? throw new NotSupportedException($"Không tìm thấy cổng thanh toán phù hợp cho '{gatewayName}'");
    }
}
