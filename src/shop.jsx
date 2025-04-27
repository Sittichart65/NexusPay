import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './ProductOrderABI.json';

const contractAddress = "0xF4a9Cfc302F4df47fd05fd1c248F6ABdAec6F804";

export default function ProductApp() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    if (connecting) return;
    setConnecting(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      const prodContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(prodContract);
      await loadProducts(prodContract);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (error.code === -32002) {
        alert("MetaMask is already asking for permission. Please check your MetaMask popup.");
      } else {
        alert(`Failed to connect wallet: ${error.message}`);
      }
    }
    setConnecting(false);
  };

  const loadProducts = async (contract) => {
    setLoading(true);
    try {
      const count = await contract.getProductCount();
      const loaded = [];
      for (let i = 1; i <= count; i++) {
        const product = await contract.getProduct(i);
        const priceInEth = ethers.formatEther(product.price);
        loaded.push({ id: i, name: product.name, price: priceInEth });
      }
      setProducts(loaded);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setLoading(false);
  };

  const addProduct = async () => {
    if (!productName || !productPrice) {
      alert("Please fill in both name and price.");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.addProduct(productName, ethers.parseEther(productPrice));
      await tx.wait();
      setProductName("");
      setProductPrice("");
      await loadProducts(contract);
    } catch (error) {
      console.error("Error adding product:", error);
    }
    setLoading(false);
  };

  const placeOrder = async (productId) => {
    if (!contract) {
      alert("Contract not connected!");
      return;
    }

    setLoading(true);
    try {
      const product = await contract.getProduct(productId);
      if (!product.isAvailable) {
        alert("Product not available");
        setLoading(false);
        return;
      }

      const tx = await contract.orderProduct(productId);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "ProductOrdered");

      if (!event) throw new Error("ProductOrdered event not found");

      const newOrderId = event.args.orderId.toString();

      const newOrder = {
        orderId: newOrderId,
        productId: productId,
        name: product.name,
        price: ethers.formatEther(product.price),
        isPaid: false,
      };
      setCurrentOrder(newOrder);
      setShowModal(true);
    } catch (error) {
      console.error("Order placement failed:", error);
      alert(`Order failed: ${error.message}`);
    }
    setLoading(false);
  };

  const payForOrder = async () => {
    if (!currentOrder) {
      alert("No order to pay for!");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.payForOrder(currentOrder.orderId, {
        value: ethers.parseEther(currentOrder.price),
      });
      await tx.wait();

      alert("Payment successful!");
      setCurrentOrder(null);
      setShowModal(false);
      await loadProducts(contract);
    } catch (error) {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-200 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">
            🛍️ NexusPay
          </h1>
          <p className="mt-2 text-gray-600">Powered by Ethereum Blockchain</p>
        </div>

        {/* Connect Wallet */}
        {!walletAddress ? (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
            
            {/* Developer link - อยู่ตรงกลางใต้ปุ่ม Connect Wallet */}
            <div className="text-center mt-4">
              <a
                href="/developer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300 inline-flex items-center"
              >
                <span>นักพัฒนา Developer Mode</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600 font-medium">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            
            {/* Developer link - อยู่ตรงกลางใต้ที่อยู่ Wallet */}
            <div className="text-center">
              <a
                href="/developer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300 inline-flex items-center"
              >
                <span>นักพัฒนา Developer Mode</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Add Product */}
        {walletAddress && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
              />
              <input
                placeholder="Price (ETH)"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={addProduct}
              disabled={loading}
              className="w-full mt-4 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>

            {/* Product List */}
            <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Available Products</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-lg text-gray-500">No products available</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xl font-semibold text-gray-800">{p.name}</div>
                      <div className="text-gray-500 mt-1">{p.price} ETH</div>
                    </div>
                    <button
                      onClick={() => placeOrder(p.id)}
                      className="mt-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-transform transform hover:scale-105"
                    >
                      Order Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 space-y-4">
            <h2 className="text-2xl font-bold text-indigo-600 text-center">Order Summary</h2>
            <div className="text-center space-y-2">
              <div className="text-lg">🛒 {currentOrder.name}</div>
              <div className="text-lg">💰 {currentOrder.price} ETH</div>
              <div className="text-lg">📦 Status: <span className="font-semibold">{currentOrder.isPaid ? "Paid" : "Pending"}</span></div>
            </div>
            <div className="flex flex-col space-y-4 mt-6">
              <button
                onClick={payForOrder}
                disabled={loading}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full shadow-md transition-transform transform hover:scale-105"
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}