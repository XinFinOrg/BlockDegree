module.exports = [
  {
    constant: true,
    inputs: [
      {
        name: "user",
        type: "address"
      }
    ],
    name: "userExists",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "userAddr",
        type: "address"
      },
      {
        name: "courseName",
        type: "string"
      },
      {
        name: "userName",
        type: "string"
      },
      {
        name: "timestamp",
        type: "string"
      },
      {
        name: "marksObtained",
        type: "uint256"
      },
      {
        name: "totalQuestions",
        type: "uint256"
      },
      {
        name: "headlessHash",
        type: "string"
      },
      {
        name: "clientHash",
        type: "string"
      }
    ],
    name: "addCertificate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "certificates",
    outputs: [
      {
        name: "courseName",
        type: "string"
      },
      {
        name: "userName",
        type: "string"
      },
      {
        name: "timestamp",
        type: "string"
      },
      {
        name: "marksObtained",
        type: "uint256"
      },
      {
        name: "totalQuestions",
        type: "uint256"
      },
      {
        name: "headlessHash",
        type: "string"
      },
      {
        name: "clientHash",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "user",
        type: "address"
      },
      {
        name: "i",
        type: "uint256"
      }
    ],
    name: "getCertificate",
    outputs: [
      {
        name: "",
        type: "string"
      },
      {
        name: "",
        type: "string"
      },
      {
        name: "",
        type: "string"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "string"
      },
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getUserCount",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "user",
        type: "address"
      }
    ],
    name: "getUserCertiCount",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "userAcnts",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  }
];
