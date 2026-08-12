using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public interface IAsnRepository
    {
        Task<AsnHeader?> GetAsnDetailsAsync(string asnNo);
        Task<bool> LinkGateToAsnAsync(string asnNo, int gateNo);
        Task<bool> CheckAsnNoExistsAsync(string asnNo);
    }
}
